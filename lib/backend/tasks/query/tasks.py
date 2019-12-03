""" This module wraps all user management functionalities from
    storage.user.py in celery tasks.

    All functionality is encapsulated in the corresponding backend
    module. """

import ast
import hashlib
import json
import time
import uuid
import logging

from sqlalchemy import exists
from sqlalchemy import and_
import celery
from celery.result import allow_join_result

from lib.config import Configuration
from lib.backend.tasks.preprocessing.tasks \
    import select_query_data, select_users, \
    split_by_privacy, add_noise, k_anonymity
from lib.backend import database as db
from lib.data_structures import QueryState
from lib.data_structures import PaymentMethod
from lib.data_structures import Query_Db
from lib.data_structures import Pin_Query_Db
from lib.data_structures import QueryUser
from lib.data_structures import enums
from lib.data_structures import AvailableDataSource
from lib.data_structures.base_object import SqlAlchemyException
from lib.backend.helper_methods import HelperMethods
from lib.backend.payments import BitcoinConnector
from lib.data_structures.privacy_setting import PrivacySetting
from .parser import SqlTransformer, sql_parser, constructConstraintList, find_and_parts


if not Configuration.initialized:
    Configuration.initialize()


functionmapping = {
    "SUM": ("diffpriv", "addAvg", "calcAvg", "apply_DiffPrivAVG"),
    "AVG": ("diffpriv", "addAvg", "calcAvg", "apply_DiffPrivAVG"),
    "COUNT": ("diffpriv", "addCount", "calcCount", "apply_DiffPrivCOUNT"),
    "RAVG": ("diffpriv", "addAvg", "calcAvg", "apply_DiffPrivRAW"),
}


def add_data_to_database(data):
    """ This function enables to commit data to the database
        without repeating the following three lines in every
        set-function. """

    session = db.get_db_session()
    session.add(data)
    session.commit()
    session.close()


""" Query
    query related tasks:
    - register_query: register query in for processing, create query reply
    - process_query: parse query, select and inform users
    - get_queries: return queries concerning a specific user
    - set_consent: set consent for user """


@celery.task(ignore_result=True)
def process_queries():
    """ Get all open queries (including pin queries), which are ready for processing (i.e., the phase, during which
        users check_authorization decide if they want to particiapte or not, is over)
        and initiate it such that the result can be calculated and the query can be closed.

    Args:

    Returns:
        - success (bool)
        - error (list of dicts):
            - content of dicts:
                - code (int):
                    24 -- Undefined failure during query processing
                - message (str): error code meaning including query information

        (returns error only if success == False)
    """
    session = db.get_db_session()
    cur_time = int(round(time.time() * 1000))
    # get processable queries, i.e. all queries for which the time for participating is over
    result = {}
    result['success'] = True
    queries = session.query(Query_Db).filter(Query_Db.state == QueryState.PENDING, Query_Db.consent_finish_time <= cur_time).all()
    requests_q = {}
    for query in queries:
        queryobj = query.as_dict()  # Make the object serializable
        query.state = 'processing'
        session.commit()
        requests_q[queryobj['query_id']] = process_query.delay(queryobj)
    # get processable pin queries, i.e. all queries for which the time for participating is over
    queries = session.query(Pin_Query_Db).filter(Pin_Query_Db.state is QueryState.PENDING, Pin_Query_Db.consent_finish_time <= cur_time).all()
    requests_qp = {}
    for query in queries:
        queryobj = query.as_dict()  # Make the object serializable
        query.state = 'processing'
        session.commit()
        requests_qp[queryobj['query_id']] = process_pin_query.delay(queryobj)
    session.close()

    for qid, res in requests_q.items():
        with allow_join_result():
            if not res.get():
                error = {}
                error['code'] = enums.Error.CANNOT_PROCESS_QUERY
                error['message'] = "Undefined failure during query processing of query " + str(qid)
                if 'error' not in result:
                    result['error'] = []
                    result['success'] = False
                result['error'].append(error)
    for qid, res in requests_qp.items():
        with allow_join_result():
            if not res.get():
                error = {}
                error['code'] = enums.Error.CANNOT_PROCESS_QUERY
                error['message'] = "Undefined failure during query processing of query " + str(qid)
                if 'error' not in result:
                    result['error'] = []
                    result['success'] = False
                result['error'].append(error)
    return result


@celery.shared_task
def process_query(query):
    """ Check if enough users gave their consent to particapte in the query, collect all needed data
        of those users and calculate the query result. Result or error message, if processing fails,
        are stored in the query database and the query state is changed accordingly

    Args:
        - session (db session): passed for consistency
        - query (query_db object): query to be processed

    Returns:
        - success (bool): True if query processing was successful, False otherwise
    """
    session = db.get_db_session()
    try:
        queryres = session.query(Query_Db).filter(Query_Db.query_id == query['query_id'], Query_Db.processor_id == query['processor_id']).one()
        result = {}
        users = {}
        # get users with consent="yes" from database
        users_db = session.query(QueryUser).filter_by(query_id=query['query_id'], proc_id=query['processor_id'], consent=QueryState.ACCEPTED)
        amount = users_db.count()
        # if enough users consented, start data processing
        if amount >= query['amount']:
            users_db = users_db.all()
            # get settings of users for relevant attributes (privacy, granularity)
            for user in users_db:
                users[user.user_id] = ast.literal_eval(user.settings)
            # select the data relevant for query
            values = select_query_data(users, query['interval_start_time'], query['interval_finish_time'], session)
            values = split_by_privacy(values)
            # select operation and calculate the result:
            response = {}
            response['amount'] = amount
            i = 0
            parsed_query = SqlTransformer().transform(sql_parser.parse(query['query']))
            for fun in parsed_query['Select']:
                attributes = list()
                for a in range(0, len(fun[0]['attr'])):
                    attributes.append(fun[0]['attr'][a].split(".")[1])
                func = functionmapping[fun[0]['name']]
                if func[0] == "kanon":
                    anonvals = k_anonymity(values, attributes)
                    if not anonvals:
                        result = '{"error":"K anonymization not possible"}'
                        queryres.state = 'aborted'
                        queryres.result = result
                        session.commit()
                        return False
                    res = globals()[func[2]](anonvals, attributes)
                    response['Fun' + str(i)] = globals()[func[1]](res, attributes)
                elif func[0] == "noise":
                    noisevals = add_noise(values, attributes)
                    res = globals()[func[2]](noisevals, attributes)
                    response['Fun' + str(i)] = globals()[func[1]](res, attributes)
                elif func[0] == "diffpriv":
                    res = globals()[func[2]](values, attributes)
                    res = globals()[func[3]](values, attributes, res)
                    response['Fun' + str(i)] = globals()[func[1]](res, attributes)
                i += 1
            result['response'] = response
            queryres.result = json.dumps(result)
            queryres.state = 'completed'
            session.commit()
        else:
            result = '{"error":"Query failed because not enough users consented"}'
            queryres.state = 'aborted'
            queryres.result = result
            session.commit()
        session.close()
        return True
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        result = '{"error":"Exception during query processing"}'
        queryres.state = 'aborted'
        queryres.result = result
        session.commit()
        session.close()
        return False


@celery.shared_task
def process_pin_query(query):
    """ Check if any user participated in the pin query and fetch the requested data from the database.
        Result or error message, if processing fails, are stored in the query database and the query
        state is changed accordingly.

    Args:
        - session (db session): passed for consistency
        - query (query_db object): pin query to be processed

    Returns:
        - success (bool): True if query processing was successful, False otherwise

    """
    session = db.get_db_session()
    # read users with consent="yes" from database
    try:
        queryres = session.query(Pin_Query_Db).filter(Query_Db.query_id == query['query_id'], Query_Db.processor_id == query['processor_id']).one()
        result = {}
        users = {}
        users_db = session.query(QueryUser).filter_by(query_id=query['query_id'], proc_id=query['processor_id'], consent=QueryState.ACCEPTED)
        amount = users_db.count()
        users = [row.user_id for row in users_db.all()]

        if amount > 0:
            # get data sources and attributes from parser
            parsed_query = SqlTransformer().transform(sql_parser.parse(query['query']))
            target_attr = list()
            for e in parsed_query['Select']:
                for i in range(0, len(e[0]['attr'])):
                    target_attr.append(e[0]['attr'][i])
            attributes = list()
            datasources = list()
            for attr in target_attr:
                temp = attr.split(".")
                datasources.append(temp[0])
                attributes.append(temp[1])
            # dict to store values for all users
            values_dict = {}
            # for each data source
            if len(datasources) == len(attributes):
                for i, data_source in enumerate(datasources):
                    cur_source = HelperMethods.classname_to_source(str(data_source))
                    query_data = session.query(cur_source).filter(cur_source.user_id.in_(users)).order_by(
                        cur_source.user_id.asc(), cur_source.timestamp.desc()).all()
                    j = 0
                    # for each user
                    for user in users:
                        if str(user) in values_dict:
                            user_values = values_dict[user]
                        else:
                            user_values = {}
                        # add attribute value, but only the first = current one
                        if j < len(query_data) and query_data[j].user_id == user:
                            user_values[str(data_source) + "." + str(attributes[i])] = getattr(query_data[j], attributes[i])
                        while j < len(query_data) and query_data[j].user_id == user:
                            j = j + 1
                        values_dict[str(user)] = user_values

            # for now, just store result in query
            response = {}
            if len(users) == 1:
                response['value'] = values_dict[str(users[0])]
            else:
                response['value'] = values_dict
            response['amount'] = amount
            result['response'] = response
            queryres.state = 'completed'
            queryres.result = json.dumps(result)
            session.commit()
        else:
            result = '{"error":"Query failed because not enough users consented"}'
            queryres.state = 'aborted'
            queryres.result = result
            session.commit()
        session.close()
        return True
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        result = '{"error":"Exception during query processing"}'
        queryres.state = 'aborted'
        queryres.result = result
        session.commit()
        session.close()
        return False


@celery.shared_task
def register_query(proc_id, query_id, query, price, amount, interval_start_time, interval_finish_time, consent_start_time, consent_finish_time, granularity, max_privacy, query_state, query_result, title, description, goal_description, thumbnail_url):
    """ Check if processor is logged in then create entry in query db and return a query reply

    Args:
        - proc_id (int): processor id
        - query_id (int): query id, e.g. 5
        - query (str): SQL query, e.g. "SELECT SUM(RandomData.random_two) WHERE PersonalInformation.city = aachen"
        - price (int): incentive for participating users, e.g. 1
        - amount (int): minimum amount of participating users needed, e.g. 3
        - interval_start_time (int): lower bound for timestamp of data, which is requested, in milliseconds. e.g. 1539122880000
        - interval_finish_time (int): upper bound for timestamp of data, which is requested, in milliseconds. e.g. 1539123880000
        - consent_start_time (int): from this point in time users can decide to participate in milliseconds. e.g. 1539124000000
        - consent_finish_time (int): up to this point of time users can decide to participate in milliseconds. e.g. 1539125800000
        - granularity: maximum distance between timestamps of succeeding data points in milliseconds, e.g. 120000
        - max_privacy: maximum privacy level of relevant data (influences accuracy of the result), e.g. 3
        - query_state (str): state of query = pending, aborted, completed, abandoned or processing
        - query_result (str): calculated result of query, if processing was successful and otherwise error message

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1 -- invalid token
                2 -- query_id, proc_id combination already exists for query
            - message (str): error code meaning
        - response (dict):
            - query_id (int): query id
            - processor_id (int): processor id

        (returns error only if success == False and response otherwise)
    """
    result = {'success': False}
    session = db.get_db_session()
    # check if entry for id combination already existis
    (ret,), = session.query(exists().where(and_(Query_Db.processor_id == proc_id, Query_Db.query_id == query_id)))
    if ret is True:
        error = {'code': enums.Error.EXISTING_QUERY_ID_PROC_ID_COMBINATION, 'message': "query_id, proc_id combination already exists for query"}
        result['error'] = error
        return result
    if query_id == -1:
        query_id = int(str(int(uuid.uuid1()))[:12])

    # create new btc address if multiple
    if Configuration.payment_mode is PaymentMethod.NONE:
        address = None
    elif Configuration.payment_mode is PaymentMethod.BITCOIN_DIRECT:
        address = None
    elif Configuration.payment_mode is PaymentMethod.BITCOIN_QUERY_BASED:
        address = BitcoinConnector.auth_proxy.getnewaddress("platform")
    # central
    elif Configuration.payment_mode is PaymentMethod.BITCOIN_CENTRAL:
        address = BitcoinConnector.platform_address
    else:  # Catch otherwise unhandled payment methods
        address = None
    # create query entry
    new_query_entry = Query_Db(
        processor_id=proc_id,
        query_id=query_id,
        query=query,
        price=price,
        interval_start_time=interval_start_time,
        interval_finish_time=interval_finish_time,
        consent_start_time=consent_start_time,
        consent_finish_time=consent_finish_time,
        amount=amount,
        granularity=granularity,
        max_privacy=max_privacy,
        state=query_state,
        result=query_result,
        address=address,
        title=title,
        description=description,
        goal_description=goal_description,
        usedDataTypes=str([]),
        thumbnail_url=thumbnail_url
    )
    db.add_data_to_database(new_query_entry)
    session.commit()
    # create query reply
    query_reply = {'query_id': query_id, 'processor_id': proc_id}
    try:
        res = prepare_query(query_id, proc_id)
        if res['success']:
            result['success'] = True
            result['response'] = query_reply
        else:
            return res
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.delete(new_query_entry)
        session.commit()
        session.close()
        result['success'] = False
        result['error'] = {'code': enums.Error.INVALID_QUERY, 'message': "The Query you entered is invalid!"}
    return result


@celery.shared_task
def register_pin_query(proc_id, query_id, session_id, query, consent_start_time, consent_finish_time, query_state, query_result):
    """ Check if processor is logged in then create entry in query db and return a query reply

    Args:
        - proc_id (int): processor id
        - query_id (int): query id, e.g. 5
        - session_id (int): id to separate processing for different users, if multiple participated
        - query (str): SQL query, e.g. "SELECT SUM(RandomData.random_two) WHERE PersonalInformation.city = aachen"
        - consent_start_time (int): from this point in time users can decide to participate in milliseconds. e.g. 1539124000000
        - consent_finish_time (int): up to this point of time users can decide to participate in milliseconds. e.g. 1539125800000
        - query_state (str): state of query = pending, aborted, completed, abandoned or processing
        - query_result (str): calculated result of query, if processing was successful and otherwise error message

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1 -- invalid token
                2 -- query_id, proc_id combination already exists for query
            - message (str): error code meaning
        - response (dict):
            - query_id (int): query id
            - processor_id (int): processor id
            - response_data (dict):
                - session_id (int): session id to differ between multiple users
                - session_pin (int): pin to give to users

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    # check if entry for id combination already existis
    (ret,), = session.query(
        exists().where(and_(Pin_Query_Db.processor_id == proc_id, Pin_Query_Db.query_id == query_id)))
    if ret is True:
        error = {'code': enums.Error.EXISTING_QUERY_ID_PROC_ID_COMBINATION, 'message': "query_id, proc_id combination already exists for query"}
        result['error'] = error
        return result
    if query_id == -1:
        query_id = int(str(int(uuid.uuid1()))[:12])

    # create query entry
    pin = int(hashlib.sha256((str(proc_id) + str(query_id)).encode('utf-8')).hexdigest(), 16) % 10**5
    new_query_entry = Pin_Query_Db(
        processor_id=proc_id,
        query_id=query_id, query=query, pin=pin,
        consent_start_time=consent_start_time,
        consent_finish_time=consent_finish_time,
        state=query_state,
        session_id=session_id,
        result=query_result,
    )
    db.add_data_to_database(new_query_entry)
    session.commit()
    # create query reply
    response_data = {'session_id': session_id, 'session_pin': pin}
    query_reply = {'query_id': query_id, 'processor_id': proc_id, 'response_data': response_data}
    result['response'] = query_reply
    result['success'] = True
    return result


@celery.shared_task
def check_query(query):
    """ Check a query's syntax. """
    result = {'success': False}
    session = db.get_db_session()
    try:
        parsed_query = SqlTransformer().transform(sql_parser.parse(query))
        target_attr = list()
        for e in parsed_query['Select']:
            for i in range(0, len(e[0]['attr'])):
                target_attr.append(e[0]['attr'][i])
        attributes = list()
        datasources = list()
        usedDataTypes = list()
        for attr in target_attr:
            temp = attr.split(".")
            datasources.append(temp[0])
            attributes.append(temp[1])
            usedDataTypes.append(HelperMethods.str_to_attr("label", HelperMethods.classname_to_source(temp[0]))[temp[1]].value)
        # construct the constraintlist from the WHERE part of the query
        if 'Where' in parsed_query:
            andparts = find_and_parts(parsed_query['Where'], list([]))
            for p in andparts:
                constraintlist = constructConstraintList(p, list([]))
                for constraint in constraintlist:
                    usedDataTypes.append(HelperMethods.str_to_attr("label", HelperMethods.classname_to_source(constraint[0]))[constraint[1]].value)
        result['success'] = True
        return result
    except Exception as e:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.INVALID_QUERY, 'message': "The Query you entered is invalid! Explicit Error: {}".format(str(e))}
        result['error'] = error
        result['success'] = False
        return result


@celery.shared_task
def prepare_query(query_id, proc_id):
    """ Select users relevant for query and store their setting to quicken further processing

    Args:
        - query_id (int): query id, e.g. 5
        - proc_id (int): processor id

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                19 -- query was not in db
                21 -- user could not be added to query user database
            - message (str): error code meaning
        - response (dict):
            - query_id (int): query id
            - processor_id (int): processor id

        (returns error only if success == False and response otherwise)
    """
    session = db.get_db_session()
    result = {'success': False}
    try:
        query = session.query(Query_Db).filter_by(processor_id=proc_id, query_id=query_id).one()
    except Exception:
        session.rollback()
        session.close()
        error = {'code': enums.Error.INVALID_TOKEN, 'message': "query was not in DB"}
        result['error'] = error
        return result
    parsed_query = SqlTransformer().transform(sql_parser.parse(query.query))
    target_attr = list()
    for e in parsed_query['Select']:
        for i in range(0, len(e[0]['attr'])):
            target_attr.append(e[0]['attr'][i])
    attributes = list()
    datasources = list()
    usedDataTypes = list()
    for attr in target_attr:
        temp = attr.split(".")
        datasources.append(temp[0])
        attributes.append(temp[1])
        usedDataTypes.append(HelperMethods.str_to_attr("label", HelperMethods.classname_to_source(temp[0]))[temp[1]].value)
    # construct the constraintlist from the WHERE part of the query
    all_users = {}
    if 'Where' in parsed_query:
        andparts = find_and_parts(parsed_query['Where'], list([]))
        for p in andparts:
            constraintlist = constructConstraintList(p, list([]))
            for constraint in constraintlist:
                usedDataTypes.append(HelperMethods.str_to_attr("label", HelperMethods.classname_to_source(constraint[0]))[constraint[1]].value)
            users = select_users(
                datasources,
                attributes,
                constraintlist,
                query.granularity,
                query.max_privacy,
                query.interval_start_time,
                query.interval_finish_time
            )
            for u in users:
                if u not in all_users.keys():
                    all_users[u] = users[u]
    else:
        users = select_users(
            datasources,
            attributes,
            [],
            query.granularity,
            query.max_privacy,
            query.interval_start_time,
            query.interval_finish_time
        )
        for u in users:
            if u not in all_users.keys():
                all_users[u] = users[u]

    # store users and their settings in database
    datasource_ids = []
    try:
        for ds in datasources:
            datasource_ids.append(
                session.query(
                    AvailableDataSource
                ).filter_by(
                    data_source_name=HelperMethods.classname_to_tablename(ds)
                ).one().data_source_id
            )
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.DATA_SOURCE_NOT_REGISTERED, 'message': "data source could not be found."}
        result['error'] = error
        return result
    try:
        session.query(Query_Db).filter_by(processor_id=proc_id, query_id=query_id).update({"usedDataTypes": str(usedDataTypes)})
        session.commit()
        for user in all_users:

            # Retrive expicit consent
            try:
                explicitConsents = session.query(PrivacySetting).filter_by(user_id=user).filter(PrivacySetting.data_source_id.in_(datasource_ids)).all()
                explicitConsents = [e.explicitconsent for e in explicitConsents]
            except Exception:
                if Configuration.test_mode:
                    logging.exception("An error occured:")
                session.rollback()
                session.close()
                error = {'code': enums.Error.INVALID_PRIVACY_LEVEL, 'message': "Could not retrive the explicit Consent!"}
                result['error'] = error
                return result
            # If explicit consent false, set querystate as accepted

            if True in explicitConsents or None in explicitConsents:
                query_user = QueryUser(user, proc_id, query_id, QueryState.PENDING, str(all_users[user]))
            else:
                query_user = QueryUser(user, proc_id, query_id, QueryState.ACCEPTED, str(all_users[user]))
            session.add(query_user)
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.ERROR_WHILE_ADDING_DATA_TO_DB, 'message': "user could not be added to query user database"}
        result['error'] = error
        return result
    session.commit()
    # Send consent notifications
    result['success'] = True
    session.close()
    return result


@celery.shared_task
def get_user_queries(user_id, query_state, consent_state):
    """ List all queries with passed query and consent state for which a user was selected and
        list all queries for which a user was selected for invalid states.

    Args:
        - user_id (int): user id
        - query_state (str): state of query = pending, aborted, completed, abandoned or processing
        - consent_state (str): state of consent given by user = pending, accepted or refused

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1  -- invalid user session token
                19 -- query was not in db
            - message (str): error code meaning
        - response (list of dicts):
            - content of dicts:
                - query_id (int): query id
                - proc_id (int): processor id
                - state (str): pending, aborted, completed, abandoned or processing

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        query_list = session.query(
            Query_Db,
            QueryUser
        ).filter(
            QueryUser.user_id == user_id
        ).filter(
            QueryUser.query_id == Query_Db.query_id
        ).filter(
            QueryUser.proc_id == Query_Db.processor_id
        )
        if query_state in [QueryState.PENDING, QueryState.ABORTED, QueryState.COMPLETED, QueryState.PROCESSING]:
            query_list = query_list.filter(Query_Db.state == query_state)
        if consent_state in [QueryState.PENDING, QueryState.ACCEPTED, QueryState.REFUSED]:
            query_list = query_list.filter(QueryUser.consent == consent_state)
        query_list = query_list.all()

        session.close()
        response = [{"query_id": row[0].query_id, "proc_id": row[0].processor_id, "query_state": row[0].state} for row in query_list]
        result['success'] = True
        result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.QUERY_NOT_IN_DB, 'message': "query was not in DB."}
        result['error'] = error
        return result


@celery.shared_task
def get_proc_queries(proc_id, query_state):
    """ List all queries which were posed by the processor with the passed processor id and have the passed
        query state and list all queries by this processor if passed state is invalid.

    Args:
        - proc_id (int): processor id
        - query_state (str): state of query = pending, aborted, completed, abandoned or processing

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1  -- invalid user session token
                19 -- query was not in db
            - message (str): error code meaning
        - response (list of dicts):
            - content of dicts:
                - query_id (int): query id
                - proc_id (int): processor id
                - state (str): pending, aborted, completed, abandoned or processing
                - result (str): calculated result or error message

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        query_list = session.query(Query_Db).filter_by(processor_id=proc_id)
        if query_state in [QueryState.PENDING, QueryState.ABORTED, QueryState.COMPLETED, QueryState.PROCESSING, QueryState.PAID]:
            query_list = query_list.filter_by(state=query_state)
        query_list = query_list.all()
        session.close()
        response = [{"query_id": row.query_id, "proc_id": row.processor_id, "state": row.state, "result": row.result} for row in query_list]
        result['success'] = True
        result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.QUERY_NOT_IN_DB, 'message': "query was not in DB"}
        result['error'] = error
        return result


@celery.shared_task
def get_proc_pin_queries(proc_id, query_state):
    """ List all queries which were posed by the processor with the passed processor id and have the passed
        query state and list all queries by this processor if passed state is invalid.

    Args:
        - proc_id (int): processor id
        - query_state (str): state of query = pending, aborted, completed, abandoned or processing

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1  -- invalid user session token
                19 -- query was not in db
            - message (str): error code meaning
        - response (list of dicts):
            - content of dicts:
                - query_id (int): query id
                - proc_id (int): processor id
                - state (str): pending, aborted, completed, abandoned or processing
                - result (str): calculated result or error message

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        query_list = session.query(Pin_Query_Db).filter_by(processor_id=proc_id)
        if query_state in [QueryState.PENDING, QueryState.ABORTED, QueryState.COMPLETED, QueryState.PROCESSING]:
            query_list = query_list.filter_by(state=query_state)
        query_list = query_list.all()
        session.close()
        response = [
            {
                "query_id": row.query_id,
                "query": row.query,
                "proc_id": row.processor_id,
                "state": row.state,
                "result": row.result,
                "consent_start_time": row.consent_start_time,
                "consent_finish_time": row.consent_finish_time
            } for row in query_list
        ]
        result['success'] = True
        result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.QUERY_NOT_IN_DB, 'message': "pin query was not in DB"}
        result['error'] = error
        return result


@celery.shared_task
def get_user_pin_queries(user_id, query_state):
    """ List all queries which were posed by the processor with the passed processor id and have the passed
        query state and list all queries by this processor if passed state is invalid.

    Args:
        - proc_id (int): processor id
        - query_state (str): state of query = pending, aborted, completed, abandoned or processing

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1  -- invalid user session token
                19 -- query was not in db
            - message (str): error code meaning
        - response (list of dicts):
            - content of dicts:
                - query_id (int): query id
                - proc_id (int): processor id
                - state (str): pending, aborted, completed, abandoned or processing
                - result (str): calculated result or error message

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        query_list = session.query(Pin_Query_Db).filter_by(user_id=user_id)
        if query_state in [QueryState.PENDING, QueryState.ABORTED, QueryState.COMPLETED, QueryState.PROCESSING]:
            query_list = query_list.filter_by(state=query_state)
        query_list = query_list.all()
        session.close()
        response = [{"query_id": row.query_id, "query": row.query, "proc_id": row.processor_id, "state": row.state, "result": row.result} for row in query_list]
        result['success'] = True
        result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.QUERY_NOT_IN_DB, 'message': "pin query was not in DB"}
        result['error'] = error
        return result


@celery.shared_task
def retrieve_query(user_id, query_id, processor=True):
    """ Get specific query in which the user with the passed id participated or which was posed by this processor.

    Args:
        - user_id (int): user id of user or processor who is posing this request
        - proc_id (int): processor id of processor who posed the query
        - processor (bool): is the user a data processor?

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1  -- invalid session token
                19 -- query was not in db
            - message (str): error code meaning
        - response (dict):
            - query_id (int): query id
            - proc_id (int): processor id
            - state (str): pending, aborted, completed, abandoned or processing
            - result (str): calculated result or error message (only returned if requested by processor)
            - consent_state (str): pending, accepted or refused (only returned if requested by user)

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        if processor:
            query_list = session.query(Query_Db).filter(Query_Db.query_id == query_id)
            row = query_list.one()
            if (row.state is not QueryState.PAID) and (row.state is not QueryState.ABORTED):
                row.result = "query not paid"
            response = {
                "query_id": row.query_id,
                "proc_id": row.processor_id,
                "query_state": row.state,
                "price": row.price,
                "interval_start_time": row.interval_start_time,
                "interval_finish_time": row.interval_finish_time,
                "consent_start_time": row.consent_start_time,
                "consent_finish_time": row.consent_finish_time,
                "amount": row.amount,
                "granularity": row.granularity,
                "max_privacy": row.max_privacy,
                "title": row.title,
                "description": row.description,
                "goal_description": row.goal_description,
                "used_data_types": ast.literal_eval(row.usedDataTypes),
                "result": row.result,
                "query": row.query,
                "thumbnail_url": row.thumbnail_url
            }
        else:
            query_list = session.query(
                Query_Db,
                QueryUser
            ).filter(
                QueryUser.query_id == query_id,
                QueryUser.user_id == user_id
            ).filter(
                Query_Db.query_id == QueryUser.query_id
            ).filter(
                Query_Db.query_id == query_id
            )
            row = query_list.one()
            response = {
                "query_id": row.Query_Db.query_id,
                "proc_id": row.Query_Db.processor_id,
                "query_state": row.Query_Db.state,
                "price": row.Query_Db.price,
                "interval_start_time": row.Query_Db.interval_start_time,
                "interval_finish_time": row.Query_Db.interval_finish_time,
                "consent_start_time": row.Query_Db.consent_start_time,
                "consent_finish_time": row.Query_Db.consent_finish_time,
                "amount": row.Query_Db.amount,
                "granularity": row.Query_Db.granularity,
                "max_privacy": row.Query_Db.max_privacy,
                "title": row.Query_Db.title,
                "description": row.Query_Db.description,
                "goal_description": row.Query_Db.goal_description,
                "used_data_types": ast.literal_eval(row.Query_Db.usedDataTypes),
                "consent_state": row.QueryUser.consent,
                "thumbnail_url": row.Query_Db.thumbnail_url
            }
        session.close()
        result['success'] = True
        result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.QUERY_NOT_IN_DB, 'message': "query was not in DB"}
        result['error'] = error
        return result


@celery.shared_task
def retrieve_pin_query(user_id, proc_id, query_id):
    """ Get specific pin query in which the user with the passed id participated or which was posed by this processor.

    Args:
        - user_id (int): user id of user or processor who is posing this request
        - proc_id (int): processor id of processor who posed the query
        - query_id (int): query id

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1  -- invalid session token
                19 -- query was not in db
            - message (str): error code meaning
        - response (dict):
            - query_id (int): query id
            - proc_id (int): processor id
            - query_state (str): pending, aborted, completed, abandoned or processing
            - result (str): calculated result or error message (only returned if requested by processor)
            - consent_state (str): pending, accepted or refused (only returned if requested by user)

        (returns error only if success == False and response otherwise)
    """

    result = {}
    result['success'] = False
    session = db.get_db_session()
    if user_id == proc_id:
        try:
            query_list = session.query(
                Pin_Query_Db
            ).filter_by(
                processor_id=proc_id,
                query_id=query_id
            )
            row = query_list.one_or_none()
        except SqlAlchemyException.MultipleResultsFound:
            if Configuration.test_mode:
                logging.exception("Ambiguous query found!")
            row = None
        if row is None:
            session.rollback()
            session.close()
            error = {'code': enums.Error.QUERY_NOT_IN_DB, 'message': "query was not in DB"}
            result['error'] = error
            return result
        response = {
            "query_id": row.query_id,
            "proc_id": row.processor_id,
            "query_state": row.state,
            "result": row.result
        }
    else:
        try:
            query_list = session.query(
                Pin_Query_Db,
                QueryUser
            ).filter(
                QueryUser.user_id == user_id,
                Pin_Query_Db.query_id == QueryUser.query_id,
                Pin_Query_Db.processor_id == QueryUser.proc_id
            )
            row = query_list.one_or_none()
        except SqlAlchemyException.MultipleResultsFound:
            if Configuration.test_mode:
                logging.exception("Ambiguous query found!")
            row = None
        if row is None:
            session.rollback()
            session.close()
            error = {'code': enums.Error.QUERY_NOT_IN_DB, 'message': "query was not in DB"}
            result['error'] = error
            return result
        response = {
            "query_id": row.Pin_Query_Db.query_id,
            "proc_id": row.Pin_Query_Db.processor_id,
            "query_state": row.Pin_Query_Db.state,
            "consent_state": row.QueryUser.consent
        }
    session.close()
    result['success'] = True
    result['response'] = response
    return result


@celery.shared_task
def get_pin_query_info(user_id, pin):
    """ Get information about pin_query (how the result would look like) before participation.

    Args:
        - user_id (int): user id of user or processor who is posing this request
        - pin (int): temporary pin by which the query can be found

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1  -- invalid session token
                19 -- query was not in db
            - message (str): error code meaning
        - response (dict):
            - query_id (int): query id
            - proc_id (int): processor id
            - query (str): SQL query
            - consent_start_time (int): point of time in milliseconds from which the user is able to change consent
            - consent_end_time (int): point of time in milliseconds until which the user is able to change consent
            - state (str): pending, aborted, completed, abandoned or processing
            - consent (str): pending, accepted or refused (only returned if requested by user)
            - result (str): calculated result as it would be shown to processor

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        query_list = session.query(Pin_Query_Db).filter_by(pin=pin)
        row = query_list.one()
        user_entry = session.query(
            QueryUser
        ).filter_by(
            proc_id=row.processor_id,
            query_id=row.query_id,
            user_id=user_id
        )
        consent = "refused"
        if user_entry.count() > 0:
            consent = user_entry.one().consent
        response = {
            "query_id": row.query_id,
            "proc_id": row.processor_id,
            "query": row.query,
            "consent_start_time": row.consent_start_time,
            "consent_finish_time": row.consent_finish_time,
            "state": row.state,
            "consent": consent,
            "result": row.result,
        }
        result['success'] = True
        result['response'] = response
        session.close()
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.QUERY_NOT_IN_DB, 'message': "query was not in DB"}
        result['error'] = error
        return result


@celery.shared_task
def set_query_consent(user_id, proc_id, query_id, accept):
    """ Change consent to participate in a query or not for the user with the passed id and
        the query with the passed processor and query ids.

    Args:
        - user_id (int): user id of user or processor who is posing this request
        - proc_id (int): processor id of processor who posed the query
        - query_id (int): id of the query
        - accept (bool): can be True or False = user gives consent vs. refuses to give consent

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1  -- invalid session token
                19 -- query was not in db
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)

    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        query = session.query(
            QueryUser
        ).filter(
            QueryUser.user_id == user_id,
            QueryUser.query_id == query_id,
            QueryUser.proc_id == proc_id
        ).one()
        if accept:
            query.consent = QueryState.ACCEPTED

        else:
            query.consent = "refused"
        session.commit()
        session.close()
        response = {}
        result['success'] = True
        result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.QUERY_NOT_IN_DB, 'message': "query was not in DB"}
        result['error'] = error
        return result


@celery.shared_task
def set_pin_query_consent(user_id, pin, accept):
    """ Change consent to participate in a pin query or not for the user with the passed id and
        the query with the passed pin.

    Args:
        - user_id (int): user id of user or processor who is posing this request
        - pin (int): pin associated with the query
        - accept (bool): can be True or False = user gives consent vs. refuses to give consent

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1  -- invalid session token
                19 -- query was not in db
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:  # get query id und proc id from pin
        entry = session.query(Pin_Query_Db).filter_by(pin=str(pin)).one()
        query_id = entry.query_id
        proc_id = entry.processor_id
        entry_count = session.query(
            QueryUser
        ).filter_by(
            proc_id=proc_id,
            query_id=query_id,
            user_id=user_id
        ).count()
        if accept is True:
            if entry_count > 0:
                query_entry = session.query(
                    QueryUser
                ).filter_by(
                    proc_id=proc_id,
                    query_id=query_id,
                    user_id=user_id
                ).one()
                query_entry.consent = "accepted"
            else:
                new_query_entry = QueryUser(
                    user_id=user_id,
                    query_id=query_id,
                    proc_id=proc_id,
                    consent="accepted",
                    settings=""
                )
                db.add_data_to_database(new_query_entry)
        else:
            if entry_count > 0:
                query_entry = session.query(
                    QueryUser
                ).filter_by(
                    proc_id=proc_id,
                    query_id=query_id,
                    user_id=user_id
                ).one()
                query_entry.consent = "refused"
            else:
                new_query_entry = QueryUser(
                    user_id=user_id,
                    query_id=query_id,
                    proc_id=proc_id,
                    consent="refused",
                    settings=""
                )
                db.add_data_to_database(new_query_entry)
        session.commit()
        session.close()
        response = {}
        result['success'] = True
        result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.QUERY_NOT_IN_DB,
                 'message': "query was not in DB"}
        result['error'] = error
        return result


def correlate(values, _):
    """ Execute correlation function. """
    result = {}
    for u in values:
        vals = {}
        for attr in values[u]:
            vals[attr] = attr
        result[u] = vals
    return result


def calcSum(values, attributes):
    """ Execute sum function. """
    result = {}
    for a in attributes:
        result[a] = {}
        for p in range(1, 4):
            result[a][p] = 0
    for attr in values:
        if attr in attributes:
            for priv in range(1, 4):
                for u in values[attr][priv]:
                    for v in values[attr][priv][u]['v']:
                        result[attr][priv] = result[attr][priv] + v
        else:
            pass
    return result


def add(values, attributes):
    """ Execute add function. """
    res = {}
    for a in attributes:
        res[a] = 0
        for priv in range(1, 4):
            res[a] += values[a][priv]
    return res


def calcAvg(values, attributes):
    """ Execute avg function. """
    result = {}
    amounts = {}
    for a in attributes:
        result[a] = {}
        amounts[a] = {}
        for p in range(1, 4):
            result[a][p] = []
            amounts[a][p] = []
    for attr in values:
        if attr in attributes:
            for priv in range(1, 4):
                for u in values[attr][priv]:

                    length = len(values[attr][priv][u]['v'])
                    if len(result[attr][priv]) == 0:
                        for i in range(length):
                            result[attr][priv].append((0, 0))
                            amounts[attr][priv].append(0)
                    for i in range(length):
                        amounts[attr][priv][i] += 1
                        result[attr][priv][i] = tuple(map(sum, zip(result[attr][priv][i], (values[attr][priv][u]['v'][i], 1))))
    for a in attributes:
        for p in range(1, 4):
            for i in range(len(result[a][p])):
                result[a][p][i] = result[a][p][i][0] / result[a][p][i][1]
    stDevs = calc_stDevs(values, attributes, result)
    res = []
    res.append(result)
    res.append(stDevs)
    res.append(amounts)
    return res


def calc_stDevs(values, attributes, means):
    """ Execute stDev function. """
    stDevs = {}
    for a in attributes:
        stDevs[a] = {}
        for p in range(1, 4):
            stDevs[a][p] = []
            for i in range(len(means[a][p])):
                stDevs[a][p].append(0)
    for a in attributes:
        for p in range(1, 4):
            for u in values[a][p]:
                for i in range(len(values[a][p][u]['v'])):
                    stDevs[a][p][i] += (values[a][p][u]['v'][i] - means[a][p][i])**2

    return stDevs


def addAvg(values, attributes):
    """ Execute addAvg function. """
    means = values[0]
    stDevs = values[1]
    amounts = values[2]
    res = {}
    length = None
    for a in attributes:
        res[a] = {}
        finalmean = []
        finalstDev = []
        count = []
        for p in range(1, 4):

            length = len(means[a][p])
            if length > 0:
                if count == []:
                    for _ in range(length):
                        count.append(0)
                if finalmean == []:
                    for _ in range(length):
                        finalmean.append(0.0)
                        finalstDev.append(0.0)
                count = [sum(x) for x in zip(count, amounts[a][p])]
                finalmean = [sum(x) for x in zip(finalmean, [c * d for c, d in zip(means[a][p], amounts[a][p])])]
                finalstDev = [sum(x) for x in zip(finalstDev, [c * d for c, d in zip(stDevs[a][p], amounts[a][p])])]

        finalmean = [c / d for c, d in zip(finalmean, count)]
        finalstDev = [c / d for c, d in zip(finalstDev, count)]
        res[a]['mean'] = finalmean
        res[a]['stDev'] = finalstDev
    return res


def calcCount(values, attributes):
    """ Counts the number of participants in each privacy class """
    res = {}
    for a in attributes:
        res[a] = {}
        for p in range(1, 4):
            res[a][p] = len(values[a][p])
    return res


def addCount(values, attributes):
    """ Execute addCount function. """
    res = {}
    for a in attributes:
        res[a] = 0
        for p in range(1, 4):
            res[a] += values[a][p]
