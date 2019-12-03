""" This module wraps all preprocessing functionalities in celery tasks.

    All functionality is encapsulated in the corresponding backend module. """
from collections import deque
import logging
from operator import add

from math import ceil
import numpy as np
import celery
from sqlalchemy import func, and_, or_

from lib.config import Configuration
from lib.config import MAX_INTERPOLATION_INTERVAL
from lib.config import INTERPOLATION_LIMIT
from lib.config import PrivacyParams
from lib.data_structures import UploadGranularity
from lib.data_structures import AvailableDataSource
from lib.data_structures import RegisteredDataSource
from lib.data_structures import PrivacySetting
from lib.backend.helper_methods import HelperMethods
from lib.backend import database as db


""" Preprocessing Section:
    This section contains all tasks needed for preprocessing:

    - create_values_dict: Create empty dictionary in which the query results can be later inserted
    - select_users: return array with users relevant for the given query
    - select_query_data: return all relevant data for answering a query
    - unify_times: unify time intervals of the data
    - unify_length: unify amount of data points """


def create_values_dict():
    """ Return an empty dict to insert the values for the given users and attributes. """
    return {'v': [], 't': [], 'a': '', 'fg': '', 'cg': ''}


@celery.shared_task
def preprocess_data(data_sources, attributes, constraints, start_time, end_time, max_privacy_level, max_granularity):
    """ Preprocessing chain.

    Args:
        - data_sources (list of str): data source table names
        - attributes (list of str): list of attribute names, such that attribute at attributes[i] belongs to the data source in data_sources[i]
        - constraints (list of lists): each list contains the data source name, the attribute name and the value/bounds which should be matched
            in the form [data_source_class, attribute_name, bounds]

            bounds is a string of the form a) "x:y" or b) "z" where
                a) x and y are integers or dates (of the form 'year/month/day') with x being a lower bound and y being an upper bound for the attribute value
                b) z can be string or integer and is compared to the attribute value
        - start_time (int): user should have data with timestamps above this value (in milliseconds)
        - start_time (int): user should have data with timestamps below this value (in milliseconds)
        - max_privacy_level (int): maximum privacy the attributes should require (because higher privacy lowers accuracy of the data)
        - max_granularity (int): maximum distance between timestamps of succeeding data points in milliseconds (because higher granularities lower the accuracy of the data)

        Example:
            data_sources = ['random_data']
            attributes = ['random_two']
            constraints = [['personal_information','city','aachen']] (i.e., attribute 'city' of data source 'personal information' should be 'aachen')
            start = 1539122520000
            end = 1539122880000
            max_privacy_level = 3
            max_granularity = 120000

    Returns:
        - dict of int : dict of the form: { user_id1 : {'v': [], 't': [], 'a': '', 'fg': '', 'cg': ''}, user_id2 : {'v': [], 't': [], 'a': '', 'fg': '', 'cg': ''}, ... }
            - v = list of values
            - t = list of timestamps belonging to the values in v
            - a = privacy level
            - fg = finest granularity = minimum distance between the timestamps of two succeeding values
            - cg = coarsest granularity = maximum distance between the timestamps of two succeeding values

        Example:

            {   391676021478103493: {'random_two': {'v':[39.35, 2.77, 43.79],
                            't':[1539122520000, 1539122640000, 1539122760000],
                            'a':3,
                            'fg':120000,
                            'cg':120000},
                            'random_one': {'v':[16.17, 35.19, 84.48],
                            't':[1539122520000, 1539122640000, 1539122760000],
                            'a':3,
                            'fg':120000,
                            'cg':120000}
                            },
                97546848572549905: {'random_two': {'v':[74.42, 56.43, 70.39],
                            't':[1539122520000, 1539122640000, 1539122760000],
                            'a':2,
                            'fg':120000,
                            'cg':120000},
                            'random_one': {'v':[30.34, 89.19, 19.05],
                            't':[1539122520000, 1539122640000, 1539122760000],
                            'a':2,
                            'fg':120000,
                            'cg':120000 }}
            }
    """

    users = select_users(data_sources, attributes, constraints, max_granularity, max_privacy_level, start_time, end_time)
    query_data = select_query_data(users, start_time, end_time)
    time_unified_data = unify_times(query_data, start_time, end_time)
    length_unified_data = unify_length(time_unified_data, start_time, end_time, max_granularity, pre_aggregate, fill_with_nones)
    split_data = split_by_privacy(length_unified_data)
    return split_data


def split_by_privacy(data):
    """ Split up selected users based on their privacy levels. """
    mapping = {}
    for u in data:
        for attr in data[u]:
            mapping[attr] = {}
            for i in range(1, 4):
                mapping[attr][i] = {}
        break
    for user in data:
        for attr in data[user]:

            mapping[attr][data[user][attr]['a']][user] = {}
            mapping[attr][data[user][attr]['a']][user]['v'] = data[user][attr]['v']
            mapping[attr][data[user][attr]['a']][user]['fg'] = data[user][attr]['fg']
            mapping[attr][data[user][attr]['a']][user]['cg'] = data[user][attr]['cg']
            mapping[attr][data[user][attr]['a']][user]['t'] = data[user][attr]['t']
    return mapping


@celery.shared_task
def select_users(data_sources, attributes, constraints, max_granularity, max_privacy_level, start_time, end_time):
    """Return an dict of user_ids (int) which are relevant for the current query and their settings for the relevant attributes

    Args:
        - data_sources (list of str): list containing strings with the data source class names, e.g. 'RandomData'
        - attributes (list of str): list attribute names, e.g. 'random_one'
        - constraints (list of lists): each list contains the data source name, the attribute name and the value/bounds which should be matched
            in the form [data_source_class, attribute_name, bounds]

            bounds is a string of the form a) "x:y" or b) "z" where
                a) x and y are integers or dates (of the form 'year/month/day') with x being a lower bound and y being an upper bound for the attribute value
                b) z can be string or integer and is compared to the attribute value
        - start_time (int): user should have data with timestamps above this value (in milliseconds)
        - end_time (int): user should have data with timestamps below this value (in milliseconds)
        - max_privacy_level (int): maximum privacy the attributes should require (because higher privacy lowers accuracy of the data)
        - max_granularity (int): maximum distance between timestamps of succeeding data points in milliseconds (because higher granularities lower the accuracy of the data)

    Returns:
        - dict of int : list of lists
            - content: { user_id1: [[data_source_name, attribute_name, a, fg, cg]], user_id2: [[data_source_name, attribute_name, a, fg, cg]], ... }
                - a = privacy level
                - fg = finest granularity = minimum distance between the timestamps of two succeeding values
                - cg = coarsest granularity = maximum distance between the timestamps of two succeeding values

            Example:
                { 97546848572549905: [['RandomData', 'random_one', 2, 60000, 60000]] }

    """
    session = db.get_db_session()
    try:
        # Get internal row IDs of data sources that appear in the query
        unified_data_sources = list(set(data_sources))
        data_source_tablenames = [HelperMethods.classname_to_tablename(ds) for ds in unified_data_sources]
        available_sources = session.query(
            AvailableDataSource.data_source_id,
            AvailableDataSource.data_source_name
        ).filter(
            AvailableDataSource.data_source_name.in_(data_source_tablenames)
        ).order_by(
            AvailableDataSource.data_source_id
        ).all()

        source_mapping = dict()
        for i, name in enumerate(unified_data_sources):
            source_mapping[name] = available_sources[i][0]

        relevant_data_sources = list(
            filter(
                lambda avs: avs[1] in data_source_tablenames,
                available_sources
            )
        )
        relevant_data_source_ids = list(
            map(
                lambda avs: avs[0],
                relevant_data_sources
            )
        )

        # Determine users who registered all relevant data sources and
        # who have compatible privacy settings
        user_ids_with_data_sources = session.query(
            RegisteredDataSource,
            PrivacySetting
        ).filter(
            and_(
                RegisteredDataSource.user_id == PrivacySetting.user_id,
                RegisteredDataSource.data_source_id == PrivacySetting.data_source_id,
                RegisteredDataSource.data_source_id.in_(relevant_data_source_ids),
                RegisteredDataSource.timestamp <= start_time,
                PrivacySetting.attribute.in_(attributes),
                PrivacySetting.level.between(1, max_privacy_level)
            )
        ).all()
        potential_user_ids = [u[0].user_id for u in user_ids_with_data_sources]

        # Get update history of granularities for potentially interesting users
        # restricted to their relevant data sources.
        relevant_upload_granularity_histories = session.query(
            UploadGranularity
        ).filter(
            and_(
                UploadGranularity.user_id.in_(potential_user_ids),
                UploadGranularity.data_source_id.in_(relevant_data_source_ids),
                UploadGranularity.timestamp <= end_time
            )
        ).group_by(
            UploadGranularity.user_id,
            UploadGranularity.data_source_id
        ).all()

        granularity_updates_per_user = dict()
        for g in relevant_upload_granularity_histories:
            if g.user_id not in granularity_updates_per_user.keys():
                granularity_updates_per_user[g.user_id] = dict()
            if g.data_source_id not in granularity_updates_per_user[g.user_id].keys():
                granularity_updates_per_user[g.user_id][g.data_source_id] = list()
            granularity_updates_per_user[g.user_id][g.data_source_id].append((g.timestamp, g.interval))

        # Filter out users with granularities during the query interval that are too coarse
        potential_users_granularities = dict()
        for u, srcs in granularity_updates_per_user.items():
            # Only keep user if he has no granularity updates violating the data processor's requirements
            exclude_user = False
            user_granularities = dict()
            for data_source_id, gs in srcs.items():
                granularities = [g[1] for g in gs]
                if max(granularities) <= max_granularity:
                    user_granularities[data_source_id] = (min(granularities), max(granularities))
                else:
                    exclude_user = True
            if not exclude_user:
                potential_users_granularities[u] = user_granularities
        potential_user_ids = [u for u in potential_users_granularities.keys()]

        # additional constraints (attributes with lower and/or upper bounds)
        for constraint in constraints:
            data_source_class = HelperMethods.classname_to_source(constraint[0])
            attr = HelperMethods.str_to_attr(constraint[1], data_source_class)
            bounds = constraint[2].split(':')
            # upper and/or lower bounds
            if len(bounds) == 2:
                lower = bounds[0]
                upper = bounds[1]
                if lower != '' and upper != '':  # Check for values outside the boundaries
                    exclusion_check = session.query(
                        data_source_class.user_id,
                        func.count(attr)
                    ).filter(
                        data_source_class.user_id.in_(potential_user_ids),
                        or_(
                            attr < lower,
                            attr > upper
                        )
                    )
                elif lower != '':  # We have only a lower bound (exclude all smaller values)
                    exclusion_check = session.query(
                        data_source_class.user_id,
                        func.count(attr)
                    ).filter(
                        data_source_class.user_id.in_(potential_user_ids),
                        attr < lower
                    )
                else:  # We have only an upper bound (exclude all larger values)
                    exclusion_check = session.query(
                        data_source_class.user_id,
                        func.count(attr)
                    ).filter(
                        data_source_class.user_id.in_(potential_user_ids),
                        attr > upper
                    )
            # check quality
            elif len(bounds) == 1 and bounds[0] != '':
                comparator = bounds[0]
                exclusion_check = session.query(
                    data_source_class.user_id,
                    # func.count(attr)
                    attr
                ).filter(
                    data_source_class.user_id.in_(potential_user_ids),
                    attr != comparator
                )
            elif len(bounds) > 2:
                raise AssertionError("Constraint value interval contains too many values: {}".format(len(bounds)))
        excluded_user_ids = exclusion_check.all()

        # Finally build set of user IDs that will remain after preselection
        user_ids = list(set(potential_user_ids) - set(excluded_user_ids))

        # Bundle required information for selected users
        """
            Example:
                { 97546848572549905: [['RandomData', 'random_one', 2, 60000, 60000]] }
        """
        result_users = dict()
        for user_id in user_ids:
            user_result = list()
            for i, data_source in enumerate(data_sources):
                data_source_id = source_mapping[data_source]
                attr = attributes[i]
                privacy_setting = [u[1].level for u in user_ids_with_data_sources if u[1].user_id == user_id and u[1].attribute == attr][0]
                user_result.append([
                    data_source,
                    attr,
                    privacy_setting,
                    potential_users_granularities[user_id][data_source_id][0],
                    potential_users_granularities[user_id][data_source_id][1],
                ])
            result_users[user_id] = user_result
        session.close()
        return result_users
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        raise
    finally:
        session.close()


@celery.shared_task
def select_query_data(users, start_time, end_time, passed_session=None):
    """ Return a dict with the user_id and relevant data needed for calculating the query result.

    Args:
        - users (dict): output of select_users()
        - start_time (int): user should have data with timestamps above this value (in milliseconds)
        - start_time (int): user should have data with timestamps below this value (in milliseconds)
        - passed_session (db_session): already existing session passed for consistency

    Returns:
        - dict of int : dict of the form: { user_id1 : {'v': [], 't': [], 'a': '', 'fg': '', 'cg': ''}, user_id2 : {'v': [], 't': [], 'a': '', 'fg': '', 'cg': ''}, ... }
            - v = list of values of single data points
            - t = list of timestamps belonging to the data point values in v
            - a = privacy level
            - fg = finest granularity = minimum distance between the timestamps of two succeeding values
            - cg = coarsest granularity = maximum distance between the timestamps of two succeeding values

        Example:
            {   839923732067498363: {'random_one': {'v':[40.29, 50.52, 56.68, 67.73],
                                    't':[1539122760000, 1539122940000, 1539123120000, 1539123300000],
                                    'a':1,
                                    'fg':180000,
                                    'cg':180000}},
                391676021478103493: {'random_one': {'v':[35.19, 84.48, 61.24, 76.92, 82.56, 49.59, 40.78],
                                    't':[1539122640000, 1539122760000, 1539122880000, 1539123000000, 1539123120000, 1539123240000, 1539123360000],
                                    'a':3,
                                    'fg':120000,
                                    'cg':120000}}
            }
    """

    if passed_session is None:
        session = db.get_db_session()
    else:
        session = passed_session
    try:
        # for every data source
        attributes = users[list(users.keys())[0]]
        for attribute in attributes:
            cur_source = HelperMethods.classname_to_source(attribute[0])
            # get entries for user_ids contained in user list and the given time interval
            query_data = session.query(cur_source).\
                filter(cur_source.timestamp.between(start_time, end_time - 1), cur_source.user_id.in_(users)).\
                order_by(cur_source.user_id.asc(), cur_source.timestamp.asc())
            # sort data for every user and every attribute into values dict
            values_dict = {}
            # collect attributes of first user's first data source
            for user in users:
                settings = users[user]
                attributes_dict = {}
                for setting in settings:
                    if setting[0] == attribute[0]:
                        a = setting[1]
                        vals = create_values_dict()
                        vals['v'] = [round(HelperMethods.str_to_attr(a, row), 2) for row in (r for r in query_data if r.user_id == user)]
                        vals['t'] = [row.timestamp for row in (r for r in query_data if r.user_id == user)]
                        vals['a'] = setting[2]
                        vals['fg'] = setting[3]
                        vals['cg'] = setting[4]
                        attributes_dict[a] = vals
                    else:
                        break
                if len(attributes_dict) > 0:
                    values_dict[user] = attributes_dict
        if passed_session is None:
            session.close()
        return values_dict
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        raise
    finally:
        if passed_session is None:
            session.close()


@celery.shared_task
def unify_times(values, start_time, end_time):

    """ Return a values-dict where all lists have a
    legal length by inserting Nones for the missing data points.
    Ensures that rows use the same times

    Args:
        - values (dict): user data in the following format = output of select_query_data():

        Example:

            values = {
                "user1": {
                            "attribute1": {"v": [1,2,3,4,5],
                                           "t": [timestamp1, timestamp2, timestamp3, timestamp4, timestamp5],
                                           "a": 4
                                           "fg": 10,
                                           "cg": 60},
                            "attribute2": {"v": [2,4,6,8,10],
                                           "t": [timestamp1, timestamp2, timestamp3, timestamp4, timestamp5],
                                           "a": 1
                                           "fg": 10,
                                           "cg": 60}
                         },
                "user2": {
                            "attribute1": {"v": [5,4,3,2],
                                           "t": [timestamp1, timestamp2, timestamp3, timestamp4],
                                           "a": 10
                                           "fg": 10,
                                           "cg": 60},
                            "attribute2": {"v": [1,2,4,8,16],
                                           "t": [timestamp1, timestamp2, timestamp3, timestamp4, timestamp5],
                                           "a": 1
                                           "fg": 10,
                                           "cg": 60}
                         }
                ...
            }

            - v = list of values of single data points
            - t = list of timestamps belonging to the data point values in v
            - a = privacy level
            - fg = finest granularity = minimum distance between the timestamps of two succeeding values
            - cg = coarsest granularity = maximum distance between the timestamps of two succeeding values

        - start_time(int): start of interval in milliseconds
        - end_time(int): end of interval in milliseconds

    """

    # for each attribute (all users have the same attributes)
    if len(list(values.values())) != 0:
        for attr in list(values.values())[0]:
            interval = end_time - start_time
            # for each user
            for user in values.keys():
                v = values[user][attr]['v']
                t = values[user][attr]['t']
                if len(v) != len(t):
                    raise AssertionError("List with values should always be as "
                                         "long as the time list. Number of values:"
                                         " {}. Number of times: {}."
                                         .format(len(v), len(t)))
                new_v = []
                new_t = []
                # use finest granulartiy to avoid loss of values: round up for higher precision
                fg = values[user][attr]['fg']
                # v_len describes how many values the user can have at max
                v_len = ceil(interval / float(fg))
                # from last possible point in time go back
                for i in range(v_len - 1, -1, -1):
                    # new timestamp
                    cur_new_t = (start_time + (fg * i))
                    new_t.append(cur_new_t)
                    # if no more values
                    if len(v) == 0:
                        new_v.append(None)
                    else:  # if still values available
                        cur_t = t.pop()
                        # if according timestamp to value fits current new timestamp
                        # (equal or later), append value
                        if cur_t >= cur_new_t:
                            new_v.append(v.pop())
                        else:
                            new_v.append(None)
                            t.append(cur_t)

                # reverse lists to get correct order
                new_v = list(reversed(new_v))
                new_t = list(reversed(new_t))

                # store
                values[user][attr]['v'] = new_v
                values[user][attr]['t'] = new_t

                # aggregate to discard Nones
                if values[user][attr]['fg'] != values[user][attr]['cg']:
                    pre_aggregate(values[user][attr], values[user][attr]['cg'], interval)

                # interpolate to discard possible Nones based on measuring errors
                interpol_v = interpolate_row(values[user][attr], fg)
                # if failed, interpol_v is False -> delete row
                if not interpol_v:
                    del values[user]
                else:
                    values[user][attr] = interpol_v

    return values


@celery.shared_task
def unify_length(values, start_time, end_time, new_gran, shorten, enlarge):
    """ Bring all rows of the same attribute to the same length and granularity
        (what is basically the same because the interval size is fixed by the
        query) by applying the given functions. One row = one dict containing 'v' and 't'.
        The granularity is the granularity determined by the query if the query has
        this attribute and the finest granularity that any row has otherwise.

    Args:
        - values (dict): user data (see unify_times)
        - start_time (int): start of interval in milliseconds
        - end_time (int): end of interval in milliseconds
        - new_gran (int): the new granularity which needs to be created as distance between succeeding timestamps
        - shorten (function): function used to shorten the row
        - enlarge (function): function used to enlarge the row

    Returns:
        - dict of int : dict: same form as input argument "values" but with unified data

    Example:
        - Input:
            {   'user1':    {   'attribute1':  {    'v':[1,2,3,4,5,6,7],
                                                    't':[1531821600000, 1531864800000, 1531908000000, 1531951200000,
                                                            1531994400000, 1532037600000, 1532080800000],
                                                    'a':4,
                                                    'fg':43200000,
                                                    'cg':43200000},
                                'attribute2':   {   'v':[1.0,4.0,8.0,11.0],
                                                    't':[1531821600000, 1531908000000, 1531994400000, 1532080800000],
                                                    'a':1,
                                                    'fg':86400000,
                                                    'cg':86400000}},
                'user2':    {   'attribute1':   {   'v':[5,4,3,2],
                                                    't':[1531821600000, 1531908000000, 1531994400000, 1532080800000],
                                                    'a':10,
                                                    'fg':86400000,
                                                    'cg':86400000},
                                'attribute2':   {   'v':[1.5,6.0,112/3,128.0],
                                                    't':[1531821600000, 1531908000000, 1531994400000, 1532080800000],
                                                    'a':1,
                                                    'fg':86400000,
                                                    'cg':86400000
                                                }
                            }
            }

        - Output:
            {   'user1':    {  'attribute1':    {   'v':[1.5,3.5,5.5,7],
                                                    't':[1531821600000, 1531908000000, 1531994400000, 1532080800000],
                                                    'a':4,
                                                    'fg':86400000,
                                                    'cg':86400000},
                                'attribute2':   {   'v':[1.0,4.0,8.0,11.0],
                                                    't':[1531821600000, 1531908000000, 1531994400000, 1532080800000],
                                                    'a':1,
                                                    'fg':86400000,
                                                    'cg':86400000
                                                }
                            },
                'user2':    {   'attribute1':   {   'v':[5,4,3,2],
                                                    't':[1531821600000, 1531908000000, 1531994400000, 1532080800000],
                                                    'a':10,
                                                    'fg':86400000,
                                                    'cg':86400000},
                                'attribute2':   {   'v':[1.5,6.0,112/3,128.0],
                                                    't':[1531821600000, 1531908000000, 1531994400000, 1532080800000],
                                                    'a':1,
                                                    'fg':86400000,
                                                    'cg':86400000
                                                }
                            }
            }

    """
    interval = end_time - start_time

    if len(list(values.values())) != 0:
        for attr in list(values.values())[0]:
            # determine new length of row based on new granularity
            if new_gran is not None:
                new_len = ceil(interval / float(new_gran))
            else:
                new_len = next(values.itervalues())[attr]['v']
                new_gran = next(values.itervalues())[attr]['cg']
                for user in values:
                    if len(values[user][attr]['v']) < new_len:
                        new_len = len(values[user][attr]['v'])
                        new_gran = values[user][attr]['cg']
            # go through all rows and either enlarge or shorten to new length
            for user in values:
                if len(values[user][attr]['v']) < new_len:
                    # This case should not occur because this would mean that we
                    # chose a not fine enough row.
                    enlarge(values[user][attr], new_gran, interval)
                elif len(values[user][attr]['v']) > new_len:
                    shorten(values[user][attr], new_gran, interval)
    return values


@celery.shared_task
def k_anonymity(values, attributes):
    """ Anonymize the given values based on anon level from config.
        If this is not possible, False is returned. Then, the query cannot be
        executed. Otherwise, the values are returned.

    Args:
        - values(dict): user data (see split_data)

        - attributes: list of the attributes to be anonymized

    """
    groups = buildgroups(values, attributes)
    if not groups:
        return False
    else:
        for a in attributes:
            for priv in range(1, 4):
                for g in groups[a][priv]:
                    actualSize = len(g)
                    v = values[a][priv][g[0]]['v']
                    for i in range(1, actualSize):
                        v = map(add, v, values[a][priv][g[i]]['v'])
                    v = map(lambda x: x / actualSize, v)
                    for u in g:
                        values[a][priv][u]['v'] = v

    return values


def buildgroups(values, attributes):
    """ builds anonymity groups for the attrbiutes in values based on the anon level in the config.
        Only builds groups with the user IDs not the values.
        returns False if not possible

    Args:
        - values(dict): user data (see split_data)

        - attributes: list of the attributes to be anonymized

    """
    # start with lowest privacy level. fill groups. if group not completely filled move the users in this group to next higher level

    groups = {}

    cur_group = []
    for attr in attributes:
        groups[attr] = {}
        for privLevel in range(1, 4):
            groups[attr][privLevel] = []

    for attr in groups:
        for currentLevel in range(1, 4):
            groupSize = PrivacyParams[currentLevel]["k-anon"]

            for u in values[attr][currentLevel]:
                if len(cur_group) < groupSize:
                    cur_group.append(u)
                if len(cur_group) == groupSize:
                    groups[attr][currentLevel].append(cur_group)
                    cur_group = []

        if currentLevel == 3:
            if cur_group != []:
                if len(groups[attr][currentLevel]) >= 1:
                    groups[attr][currentLevel][-1] += cur_group

                    cur_group = []
                else:
                    return False
    return groups


def add_noise(values, attributes):
    """ Add noise to all values according to the specified privacy level, which are in the attributes list
        Args:
            - values(dict): user data (see split_data)

            - attributes: list of the attributes to be anonymized

    """
    for attr in attributes:
        fixpoint = None
        for priv in range(1, 4):
            noisefactor = PrivacyParams[priv]['noise']
            for u in values[attr][priv]:
                if fixpoint is None:
                    fixpoint = values[attr][priv][u]['v'][0]
                    # Setting orienting value to first value of the first user. This value will be used as orientation for the variation for the whole attribute
                for i in range(len(values[attr][priv][u]['v'])):
                    values[attr][priv][u]['v'][i] += gaussian(0, noisefactor * fixpoint)
    return values


def gaussian(mean, var):
    """ Draw Gaussian noise. """
    noise = np.random.normal(mean, var, 1)
    return noise[0]


def apply_DiffPrivRAW(_, inp):
    """ Dummy wrapper for differential privacy for showcasing purposes. """
    return inp


def apply_DiffPrivCOUNT(_, attributes, inp):
    """ Apply differential privacy to a COUNT query. """
    sensitivity = 1
    for a in attributes:
        for p in range(1, 4):
            eps = PrivacyParams[p]['diffpriv']
            negativeBackup = inp[a][p]
            inp[a][p] = round(inp[a][p] + np.random.laplace(0, sensitivity / eps))
            while inp[a][p] < 0:
                inp[a][p] = round(negativeBackup + np.random.laplace(0, sensitivity / eps))
    return input


def apply_DiffPrivAVG(values, attributes, inp):
    """ Apply differential privacy to an AVG query. """
    means = inp[0]
    stDevs = inp[1]
    amounts = inp[2]
    sensitivites = get_sensitivities(values, attributes)

    for a in attributes:
        meanSens = sensitivites[a][0]
        stDevSens = sensitivites[a][1]
        for p in range(1, 4):
            eps = PrivacyParams[p]['diffpriv']
            for i in range(len(means[a][p])):
                if means[a][p][i] != 0:
                    means[a][p][i] += np.random.laplace(0, meanSens / eps)
                negativeBackup = stDevs[a][p][i]  # to avoid stDev getting negative
                if stDevs[a][p][i] != 0:
                    stDevs[a][p][i] = negativeBackup + np.random.laplace(0, stDevSens / eps)
                    while stDevs[a][p][i] < 0:
                        stDevs[a][p][i] = negativeBackup + np.random.laplace(0, stDevSens / eps)
    res = []
    res.append(means)
    res.append(stDevs)
    res.append(amounts)
    return res


def get_sensitivities(values, attributes):
    """ gets values returns the sensitivities for mean and StDeriv for each priv level

    Args:
        - values(dict): user data (see split_data)

        - attributes: list of the attributes to be anonymized
    """
    """ This implements the sensitivity specifically for the Naive Bayes algorithm.
        It is necessary to determine a range for the attribute. This is done by taking the maximum and minimum value
        of all entries that are in the result set. This introduces an error based on the datapoints taken as they do not
        necessarily cover the whole range, but to proof the possibility of diff Priv this should be sufficient """
    res = {}
    v_max = {}
    v_min = {}
    count = 0
    for a in attributes:
        res[a] = []
        v_max[a] = None
        v_min[a] = None
    for attr in attributes:
        for priv in range(1, 4):
            for u in values[attr][priv]:
                count += 1
                for v in values[attr][priv][u]['v']:
                    if v_max[attr] is None:
                        v_max[attr] = v
                    elif v_max[attr] <= v:
                        v_max[attr] = v
                    if v_min[attr] is None:
                        v_min[attr] = v
                    elif v_min[attr] >= v:
                        v_min[attr] = v
    for a in attributes:
        MeanSens = (v_max[a] - v_min[a]) / (count + 1)
        StDevSens = (count**(0.5) * MeanSens)
        res[a].append(MeanSens)
        res[a].append(StDevSens)
    return res


""" Preprocessing Helper Section:

    This section contains all tasks needed for preprocessing:
    - pre_aggregate: Replace unnecessary values by computing an average of multiple values
    - interpolate_row: Interpolates all None values, if at least INTERPOLATION_LIMIT values are present
    - fill_with_nones: Fill up with Nones to come to the desired granularity """


# used as "shorten" function in unify_length()
def pre_aggregate(row, new_gran, interval):
    """ Replace unnecessary values by computing an average following a tree
        topology.

        Args:
            - row (dict): The row to edit (see unify_times and unify_length)
            - new_gran (int): The new granularity in milliseconds
            - interval (int): The time interval between two succeeding timestamps in microseconds

        Attention: This function does only work, if the new granularity is a
        multiple of the old one. """
    v = row['v']
    t = row['t']
    # get old granularity
    gran = t[1] - t[0]
    if new_gran % gran != 0:
        raise ValueError("The new granularity (", str(new_gran), ") is not a multiple of the old one (", str(gran), "!")
    if new_gran < gran:
        raise ValueError("The new granularity (", str(new_gran), ") is smaller than the old one (", str(gran), " but pre-aggregate can only enlarge the granularity of a row!")
    # calculate new length of the row based on new granularity
    v_len = ceil(interval / float(new_gran))
    # calculate of how many old values one new value is composed
    factor = int(new_gran / gran)
    # new times row
    new_t = [t[0]]
    for i in range(0, v_len - 1):
        new_t.append(new_t[i] + new_gran)
    # new values row
    new_v = []
    for i in range(0, v_len - 1):
        # first value of #factor values to aggregate
        first_val = factor * i
        vals_to_agg = []
        # as many values as factor is big
        for j in range(first_val, first_val + factor):
            if v[j] is not None:
                vals_to_agg.append(v[j])
        # append average of those values to new value list
        if len(vals_to_agg) > 0:
            new_v.append(round(sum(vals_to_agg) / float(len(vals_to_agg)), 2))
        else:
            new_v.append(None)

    vals_to_agg = v[factor * (v_len - 1):]
    while None in vals_to_agg:
        vals_to_agg.remove(None)
    if len(vals_to_agg) > 0:
        new_v.append(round(sum(vals_to_agg) / float(len(vals_to_agg)), 2))
    else:
        new_v.append(None)
    row['v'] = new_v
    row['t'] = new_t
    row['fg'] = new_gran
    row['cg'] = new_gran

    return row


def interpolate_row(row, gran):
    """ Interpolates all None values, if at least INTERPOLATION_LIMIT values
        are present. Otherwise, False is returned.

    Args:
        - row (dict): The row to edit (see unify_times and unify_length)
        - gran (int): The granularity in milliseconds

    """
    values = row['v']

    # calculate how many consecutive values are allowed to be Nones
    max_interpolation_num = MAX_INTERPOLATION_INTERVAL / gran

    # test if the percentage of Nones is less or equal than INTERPOLATION_LIMIT of the total amount of values in the row
    # return False otherwise
    # Also get largest number of consecutive missing values
    missing_counter = 0
    total_missing_counter = 0
    max_missing_counter = 0
    for v in values:
        if v is None:
            missing_counter += 1
            total_missing_counter += 1
        else:
            max_missing_counter = max(missing_counter, max_missing_counter)
            missing_counter = 0
    if total_missing_counter / (1. * len(values)) > INTERPOLATION_LIMIT or missing_counter > max_interpolation_num:
        # Aborting interpolation since too many values are missing
        return False

    # Precompute where to repair what (for unbiased repairment)
    # Result is a list of None intervals with lower and upper border values, i.e.:
    # [ (x_lower_0, x_upper_0, v_lower_0, v_upper_0), ... ]
    # The indices here indicate the first and last entries being None, respectively.
    # This means, a single missing value will cause x_lower == x_upper.
    # By just progressing linearly, we progressively skew interpolation results by
    # interpreting previously interpolated values as given ones.
    interpolation_intervals = list()
    in_none_interval = False
    x_lower, x_upper, v_lower, v_upper = (0, 0, 0.0, 0.0)
    for i, v in enumerate(values):
        if v is None:
            if not in_none_interval:
                x_lower = i
                v_lower = values[i - 1] if i > 0 else None
            in_none_interval = True
        else:
            if in_none_interval:
                x_upper = i - 1
                v_upper = values[i]
                interpolation_intervals.append((x_lower, x_upper, v_lower, v_upper))
                in_none_interval = False
    if in_none_interval:
        x_upper = len(values) - 1
        v_upper = None
        interpolation_intervals.append(x_lower, x_upper, v_lower, v_upper)

    for x_lower, x_upper, v_lower, v_upper in interpolation_intervals:
        relevant_indices = range(x_lower, x_upper + 1)
        dist = len(relevant_indices) + 1  # We consider spaces in between elements as adding to the distance
        for i, ind in enumerate(relevant_indices):
            if v_lower is None:
                values[ind] = v_upper
            elif v_upper is None:
                values[ind] = v_lower
            else:
                factor_upper = 1. + i  # Going right strengthens influence of upper value
                factor_lower = (dist - 1.) - i  # Going right weakens influence of lower value
                weight_upper = factor_upper / dist
                weight_lower = factor_lower / dist
                values[ind] = weight_lower * v_lower + weight_upper * v_upper
    row['v'] = values
    return row


# used as "enlargen" function in unify_length()
def fill_with_nones(row, new_gran, interval):
    """ Fill up with Nones to come provide the desired granularity.

    Args:
        - row (dict): The row to edit (see unify_times and unify_length)
        - new_gran (int): The new granularity in microseconds
        - interval (int): The time interval between two succeeding timestamps in microseconds
    """
    v = deque(row['v'])
    t = deque(row['t'])
    start = t[0]
    # new value and times row
    new_v = []
    new_t = []
    v_len = ceil(interval / float(new_gran))
    for i in range(0, v_len):  # is time point in result
        cur_time = start + (new_gran * i)
        new_t.append(cur_time)
        if len(v) != 0:
            tmp_t = t.popleft()
            tmp_v = v.popleft()
            if tmp_t < cur_time:
                # we skipped one data point because the granularities are not
                # exact multiples. However, we do not want to lose the data
                # point. Thus, we add it to the last time which was None.
                new_v[i - 1] = tmp_v
            else:
                # Put values back
                t.appendleft(tmp_t)
                v.appendleft(tmp_v)
        if t[0] == cur_time:
            new_v.append(v.popleft())
            t.popleft()
        else:
            new_v.append(None)
    row['v'] = new_v
    row['t'] = new_t
    row['fg'] = new_gran
    row['cg'] = new_gran
    if len(v) != 0:
        raise AssertionError("Unused value: " + str(v))
    return row
