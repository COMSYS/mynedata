""" This module wraps all Data Source management functionalities from
    storage.Data_Source.py in celery tasks.

    All functionality is encapsulated in the corresponding backend
    module. """

import json
import time
import logging

import celery
from lib.config import Configuration

from lib.data_structures import token
from lib.data_structures.access_token import AccessToken
from lib.data_structures.available_data_source import AvailableDataSource
from lib.data_structures.upload_granularity import UploadGranularity
from lib.data_structures.registered_data_source import RegisteredDataSource
from lib.data_structures.privacy_default import PrivacyDefault
from lib.data_structures.privacy_setting import PrivacySetting
from lib.data_structures import enums
from lib.data_structures import UserDataType
from lib.backend.helper_methods import HelperMethods
from lib.data_sources import PersonalInformation, RandomData, OpenhabSensor, Iris
from lib.backend import database as db


""" Data Source Section:
    This section contains all user related tasks:
    - add_data_source: add datasource for given user (add data source)
    - get_data_source_list: list all registered datasources for given user (get data source list)
    - remove_data_source: remove data source from list of registered for given user (remove data source)
"""


@celery.shared_task
def add_available_data_source(data_source_name, data_source_id):
    """ Add new data source to the table of available data sources (= which can be registered by a user
        and processed in a query) to the database.

    Args:
        - data_source_name (str): name of the data source
        - data_source_id (int): uid of the data source

    Returns:
        - success (bool)
        - error (dict):
        - content of dicts:
            - code (int):
                7  -- data source uuid already exists
                99 -- undefined
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False)
    """
    new_data_source = AvailableDataSource(data_source_name, data_source_id)
    session = db.get_db_session()
    result = {}
    result['success'] = False
    try:
        if session.query(AvailableDataSource).filter_by(data_source_id=data_source_id).count():
            error = {}
            error['code'] = enums.Error.DATA_SOURCE_UUID_ALREADY_EXISTS
            error['message'] = "data source uuid already exists"
            result['error'] = error
            session.close()
            return result
        else:
            session.add(new_data_source)
            session.commit()
            session.close()
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result
    result['success'] = True
    result['response'] = {}
    session.close()
    return result


@celery.shared_task
def remove_available_data_source(data_source_name, data_source_id):
    """ Remove available_data_source from database.

    Args:
        - data_source_name (str): name of the data source
        - data_source_id (int): uid of the data source

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                8 -- No such data source
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)

    """
    session = db.get_db_session()
    result = {}
    result['success'] = False
    try:
        source_to_remove = session.query(AvailableDataSource).filter_by(data_source_id=data_source_id,
                                                                        data_source_name=data_source_name).one()
        session.delete(source_to_remove)
        session.commit()
        session.close()
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.commit()
        session.close()
        error = {}
        error['code'] = enums.Error.NO_SUCH_DATA_SOURCE
        error['message'] = "No such data source"
        result['error'] = error
        return result
    result['success'] = True
    result['response'] = {}
    return result


@celery.shared_task
def add_data_source(user_id, data_source_id, access_token, upload_interval, privacy_settings, timestamp):
    """ Register a specific data source for a specific user. For this, different objects need to be created in the data base
        like privacy and upload granularity settings.

    Args:
        - user_id (int): uid of the user
        - user_token (str): token of the user
        - data_source_id (int): uid of the data source
        - access_token (str): access token of the user for the data source
        - upload_interval (int): granularity of the data source
        - privacy_settings (list of dict): contains the privacy level (int) for the attributes (str) of the data source, e.g.::

            [
                {
                    "attribute": "TestAttribut1",
                    "level": 3
                },
                {
                    "attribute": "TestAttribut2",
                    "level": 3
                }
            ]


        - timestamp (int): time in milliseconds since the epoch, can also be ``None``

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid token
                7 -- Data Source with user_id already exists
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()

    try:
        already_registered_data_source = session.query(
            RegisteredDataSource
        ).filter_by(
            data_source_id=data_source_id,
            user_id=user_id
        ).one_or_none()
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "Internal server error"
        result['error'] = error
        return result
    if already_registered_data_source:
        session.close()
        error = {}
        error['code'] = enums.Error.DATA_SOURCE_UUID_ALREADY_EXISTS
        error['message'] = "Data Source with user_id already exists"
        result['error'] = error
        return result
    if timestamp is None:
        # add data source to list of registered sources
        new_data_source = RegisteredDataSource(
            data_source_id,
            user_id,
            int(round(time.time() * 1000))
        )
        # add upload granularity for this user and source
        new_upload_granularity = UploadGranularity(
            user_id,
            data_source_id,
            int(round(time.time() * 1000)),
            upload_interval
        )
    else:
        # add data source to list of registered sources
        new_data_source = RegisteredDataSource(
            data_source_id,
            user_id,
            timestamp
        )
        # add upload granularity for this user and source
        new_upload_granularity = UploadGranularity(
            user_id,
            data_source_id,
            timestamp,
            upload_interval
        )
    session.add(new_data_source)
    session.add(new_upload_granularity)
    # add access token for this user and source
    new_access_token = AccessToken(
        data_source_id,
        user_id,
        access_token
    )
    session.add(new_access_token)
    # add privacy setting for this user and source (use default if not given for a specific attribute)
    attributes = []
    for privacy in privacy_settings:
        new_privacy_setting = PrivacySetting(
            data_source_id,
            privacy.get("attribute"),
            user_id,
            privacy.get("level"),
            privacy.get("explicitconsent")
        )
        session.add(new_privacy_setting)
        attributes.append(privacy.get("attribute"))

    data_source_name = session.query(
        AvailableDataSource
    ).filter_by(
        data_source_id=data_source_id
    ).one().data_source_name
    data_source = HelperMethods.tablename_to_source(data_source_name)
    for key in data_source.label:
        if key not in attributes:
            privdef = session.query(
                PrivacyDefault
            ).filter_by(
                user_id=user_id,
                label=data_source.label.get(key)
            ).one()
            new_privacy_setting = PrivacySetting(
                data_source_id,
                key,
                user_id,
                privdef.level,
                privdef.explicitconsent
            )
            session.add(new_privacy_setting)
    session.commit()
    session.close()
    result['success'] = True
    result['response'] = {}
    return result


@celery.shared_task
def get_data_source_list(user_id, detail):
    """ Return a list of currently registered data sources for the user with the passed user id.

    Args:
        - user_id (int): uid of user
        - user_token (str): user session token
        - detail (bool): If ``False``, lists only the ``data_source_id`` and ``data_source_name``, if ``True`` also lists ``timestamp``, ``upload_interval`` and ``access_token``

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid token
                99 -- undefined
            - message (str): error code meaning including query information
        - response (list of dicts):
            - content of dicts:
                - data_source_id (int): data source id
                - data_source_name (str): data source name

                additionally, if detail is True:
                - timestamp (int): time of registration in milliseconds
                - upload_interval (int): distance between timestamps of succeeding data points in milliseconds
                - access_token (str): oauth/oauth2 token for fetching data from this data source
                - privacy (list of dicts):
                    - content of dicts:
                        - attribute (str): attribute name
                        - level (int): privacy level of attribute

            Example response value:
            [
                {
                    'data_source_id': 1,
                    'data_source_name': 'facebook',
                    'timestamp': 1
                    'upload_interval': 20000,
                    'access_token': 'ABC',
                    'privacy': [{'attribue':'attribute1','level':4}]
                },
                ...
            ]

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    # check if user token was correct
    session = db.get_db_session()
    try:
        if detail:
            data_source_list = session.query(AvailableDataSource, RegisteredDataSource, AccessToken, UploadGranularity, PrivacySetting). \
                filter(RegisteredDataSource.user_id == user_id). \
                filter(AccessToken.user_id == user_id). \
                filter(UploadGranularity.user_id == user_id). \
                filter(PrivacySetting.user_id == user_id). \
                filter(RegisteredDataSource.data_source_id == AvailableDataSource.data_source_id). \
                filter(RegisteredDataSource.data_source_id == UploadGranularity.data_source_id). \
                filter(RegisteredDataSource.data_source_id == AccessToken.data_source_id). \
                filter(RegisteredDataSource.data_source_id == PrivacySetting.data_source_id). \
                order_by(RegisteredDataSource.data_source_id.asc(), UploadGranularity.timestamp.desc())
            data_source_list = data_source_list.all()
        else:
            data_source_list = session.query(AvailableDataSource, RegisteredDataSource). \
                filter(AvailableDataSource.data_source_id == RegisteredDataSource.data_source_id). \
                filter(RegisteredDataSource.user_id == user_id)
            data_source_list = data_source_list.all()
        response = []
        i = 0
        while i < len(data_source_list):
            element = data_source_list[i]
            element_dict = {}
            element_dict["data_source_id"] = element.RegisteredDataSource.data_source_id
            element_dict["data_source_name"] = element.AvailableDataSource.data_source_name
            if detail:
                element_dict["timestamp"] = element.RegisteredDataSource.data_source_id
                element_dict["upload_interval"] = element.UploadGranularity.interval
                element_dict["access_token"] = element.AccessToken.token
                privacy = []
                privacy.append({
                    'attribute': element.PrivacySetting.attribute,
                    'level': element.PrivacySetting.level,
                    'explicitconsent': element.PrivacySetting.explicitconsent
                })
                while i + 1 < len(data_source_list) and data_source_list[i + 1].RegisteredDataSource.data_source_id == element_dict["data_source_id"]:
                    i += 1
                    element = data_source_list[i]
                    if ({'attribute': element.PrivacySetting.attribute,
                         'level': element.PrivacySetting.level,
                         'explicitconsent': element.PrivacySetting.explicitconsent}) not in privacy:
                        privacy.append(
                            {'attribute': element.PrivacySetting.attribute, 'level': element.PrivacySetting.level, 'explicitconsent': element.PrivacySetting.explicitconsent})
                element_dict["privacy_level"] = privacy
            response.append(element_dict)
            i += 1
        session.close()
        result['success'] = True
        result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def get_data_source_information(user_id, data_source_id):
    """ Return information about a specific registered data source.

    Args:
        - user_id (int): uid of user
        - data_source_id (int): id of data source to get information about

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid token
                9 -- data source not registered for user
                99 -- undefined
            - message (str): error code meaning including query information
        - response (list of dicts):
            - content of dicts:
                - data_source_id (int): data source id
                - data_source_name (str): data source name
                - timestamp (int): time of registration in milliseconds
                - upload_interval (int): distance between timestamps of succeeding data points in milliseconds
                - access_token (str): oauth/oauth2 token for fetching data from this data source
                - privacy_level (list of dicts):
                    - content of dicts:
                        - attribute (str): attribute name
                        - level (int): privacy level of attribute

            Example response value:
            [
                {
                    'data_source_id': 1,
                    'data_source_name': 'facebook',
                    'timestamp': 1
                    'upload_interval': 20000,
                    'access_token': 'ABC',
                    'privacy': [{'attribue':'attribute1','level':4}]
                },
                ...
            ]

        (returns error only if success == False and response otherwise)
    """

    result = {}
    result['success'] = False
    # check if user token was correct
    session = db.get_db_session()
    try:
        data_source_information = session.query(
            AvailableDataSource,
            RegisteredDataSource,
            PrivacySetting,
            UploadGranularity,
            AccessToken
        ).filter(
            RegisteredDataSource.data_source_id == AvailableDataSource.data_source_id
        ).filter(
            RegisteredDataSource.data_source_id == PrivacySetting.data_source_id
        ).filter(
            RegisteredDataSource.data_source_id == UploadGranularity.data_source_id
        ).filter(
            RegisteredDataSource.data_source_id == AccessToken.data_source_id
        ).filter(
            RegisteredDataSource.user_id == user_id
        ).filter(
            RegisteredDataSource.data_source_id == data_source_id
        ).order_by(
            UploadGranularity.timestamp.desc()
        )
        data_source_information = data_source_information.all()
        if len(data_source_information) == 0:
            session.close()
            error = {}
            error['code'] = enums.Error.DATA_SOURCE_NOT_REGISTERED
            error['message'] = "Data source not registered for user"
            result['error'] = error
        else:
            response = {}
            response["data_source_id"] = data_source_information[0].RegisteredDataSource.data_source_id
            response["data_source_name"] = data_source_information[0].AvailableDataSource.data_source_name
            response["data_source_type"] = HelperMethods.tablename_to_source(response["data_source_name"]).label
            response["timestamp"] = data_source_information[0].RegisteredDataSource.data_source_id
            privacy = []
            for row in data_source_information:
                cur_privacy = {
                    "attribute": row.PrivacySetting.attribute,
                    "level": row.PrivacySetting.level,
                    "explicitconsent": row.PrivacySetting.explicitconsent,
                }
                if cur_privacy not in privacy:
                    privacy.append(cur_privacy)
            response["privacy_level"] = privacy
            response["upload_interval"] = data_source_information[0].UploadGranularity.interval
            response["access_token"] = data_source_information[0].AccessToken.token
            session.close()
            result['success'] = True
            result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def remove_registered_data_source(user_id, data_source_id):
    """ Remove a data source from list of registered sources of a user.

    Args:
        - user_id (int): uid of user
        - data_source_id (int): id of data source to remove information about

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                9 -- data source not registered for user
                99 -- undefined
            - message (str): error code meaning including query information

        (returns error only if success == False)
    """

    result = {}
    result['success'] = False
    try:
        session = db.get_db_session()
        # remove data source from registered sources
        delete_data_source = session.query(RegisteredDataSource). \
            filter_by(user_id=user_id, data_source_id=data_source_id).all()
        if delete_data_source == []:
            session.close()
            error = {}
            error['code'] = enums.Error.DATA_SOURCE_NOT_REGISTERED
            error['message'] = "Data source not registered for user"
            result['error'] = error
            return result
        for element in delete_data_source:
            session.delete(element)
        result['success'] = True
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def remove_access_token(user_id, data_source_id):
    """ Remove the access token belonging to a user and data source.

    Args:
        - user_id (int): uid of user
        - data_source_id (int): id of data source to remove information about

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                14 -- access token for this data source and user not found
                99 -- undefined
            - message (str): error code meaning including query information

        (returns error only if success == False)
    """

    result = {}
    result['success'] = False
    try:
        session = db.get_db_session()
        # remove access token for user to this source
        delete_access_token = session.query(AccessToken). \
            filter_by(data_source_id=data_source_id, user_id=user_id)
        delete_access_token = delete_access_token.all()
        if delete_access_token == []:
            session.close()
            error = {}
            error['code'] = enums.Error.ACCESS_TOKEN_NOT_IN_DB
            error['message'] = "Access token for this data source and user not found"
            result['error'] = error
            return result
        for element in delete_access_token:
            session.delete(element)
        result['success'] = True
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def remove_privacy_setting(user_id, data_source_id):
    """ Remove the privacy settings belonging to a user and data source.

    Args:
        - user_id (int): uid of user
        - data_source_id (int): id of data source to remove information about

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                15 -- privacy levels for this data source and user not found
                99 -- undefined
            - message (str): error code meaning including query information

        (returns error only if success == False)

    """

    result = {}
    result['success'] = False
    try:
        session = db.get_db_session()
        # remove privacy
        delete_privacy_levels = session.query(PrivacySetting). \
            filter_by(data_source_id=data_source_id, user_id=user_id)
        delete_privacy_levels = delete_privacy_levels.all()
        if delete_privacy_levels == []:
            session.close()
            error = {}
            error['code'] = enums.Error.PRIVACY_LEVEL_NOT_IN_DB
            error['message'] = "Privacy levels for this data source and user not found"
            result['error'] = error
            return result
        for element in delete_privacy_levels:
            session.delete(element)
        result['success'] = True
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def remove_granularity_setting(user_id, data_source_id):
    """ Remove the upload granularities belonging to a user and data source.

    Args:
        - user_id (int): uid of user
        - data_source_id (int): id of data source to remove information about

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                16 -- upload granularities for this data source and user not found
                99 -- undefined
            - message (str): error code meaning including query information

        (returns error only if success == False)
    """

    result = {}
    result['success'] = False
    try:
        session = db.get_db_session()
        # remove granularities
        delete_upload_granularities = session.query(UploadGranularity). \
            filter_by(data_source_id=data_source_id, user_id=user_id)
        delete_upload_granularities = delete_upload_granularities.all()
        if delete_upload_granularities == []:
            session.close()
            error = {}
            error['code'] = enums.Error.GRANULARITY_NOT_IN_DB
            error['message'] = "Granularity for this data source and user not found"
            result['error'] = error
            return result
        for element in delete_upload_granularities:
            session.delete(element)
        result['success'] = True
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def remove_data_source_data(user_id, data_source_id, data_source_name):
    """ Remove all information and data points belonging to a user and data source.

    Args:
        - user_id (int): uid of user
        - data_source_id (int): id of data source to remove information about
        - data_source_name (str): name of data source to remove information about

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                8 -- data source not existing
                9 -- data source not registered for this user
                14 -- access token for this data source and user not found
                15 -- privacy levels for this data source and user not found
                16 -- granularities for this data source and user not found
                99 -- undefined
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)

    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    if data_source_name is False:
        try:
            data_source_name = session.query(
                AvailableDataSource.data_source_name
            ).filter_by(
                data_source_id=data_source_id
            ).one()[0]
        except Exception:
            if Configuration.test_mode:
                logging.exception("An error occured:")
            session.close()
            error = {}
            error['code'] = enums.Error.NO_SUCH_DATA_SOURCE
            error['message'] = "No such data source"
            result['error'] = error
            return result
    try:
        # remove data source from registered sources
        delete_data_source = session.query(RegisteredDataSource). \
            filter_by(user_id=user_id, data_source_id=data_source_id).all()
        if delete_data_source == []:
            session.close()
            error = {}
            error['code'] = enums.Error.DATA_SOURCE_NOT_REGISTERED
            error['message'] = "Data source not registered for this user"
            result['error'] = error
            return result
        for element in delete_data_source:
            session.delete(element)
        # remove access token for user to this source
        delete_access_token = session.query(AccessToken). \
            filter_by(data_source_id=data_source_id, user_id=user_id)
        delete_access_token = delete_access_token.all()
        if delete_access_token == []:
            session.close()
            error = {}
            error['code'] = enums.Error.ACCESS_TOKEN_NOT_IN_DB
            error['message'] = "Access token for this data source and user not found"
            result['error'] = error
            return result
        for element in delete_access_token:
            session.delete(element)
        # remove privacy
        delete_privacy_levels = session.query(PrivacySetting). \
            filter_by(data_source_id=data_source_id, user_id=user_id)
        delete_privacy_levels = delete_privacy_levels.all()
        if delete_privacy_levels == []:
            session.close()
            error = {}
            error['code'] = enums.Error.PRIVACY_LEVEL_NOT_IN_DB
            error['message'] = "Privacy levels for this data source and user not found"
            result['error'] = error
            return result
        for element in delete_privacy_levels:
            session.delete(element)
        # remove granularities
        delete_upload_granularities = session.query(UploadGranularity). \
            filter_by(data_source_id=data_source_id, user_id=user_id)
        delete_upload_granularities = delete_upload_granularities.all()
        if delete_upload_granularities == []:
            session.close()
            error = {}
            error['code'] = enums.Error.GRANULARITY_NOT_IN_DB
            error['message'] = "Granularity for this data source and user not found"
            result['error'] = error
            return result
        for element in delete_upload_granularities:
            session.delete(element)
        # remove actual data points
        data_points = session.query(HelperMethods.tablename_to_source(data_source_name)).filter_by(user_id=user_id).all()
        for element in data_points:
            session.delete(element)
        # write changes to data base
        session.commit()
        session.close()
        result['success'] = True
        result['response'] = {}
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def remove_data_source(user_id, data_source_id):
    """ Remove all information and data points belonging to a user and data source after checking
        the user's session token.

    Args:
        - user_id (int): uid of user
        - data_source_id (int): id of data source to remove information about

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid session token
                8 -- data source not existing
                9 -- data source not registered for this user
                14 -- access token for this data source and user not found
                15 -- privacy levels for this data source and user not found
                16 -- granularities for this data source and user not found
                99 -- undefined
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    # check if user token was correct
    return remove_data_source_data(user_id, data_source_id, False)


@celery.shared_task
def remove_data_sources(user_id, data_sources):
    """ Remove all information and data points belonging to a user and multiple data sources.

    Args:
        - user_id (int): uid of user
        - data_sources (list of dicts):
            - content of dicts:
                - data_source_id (int): id of data source
                - data_source_name (str): name of data source

    Returns:
        - success (bool)
        - error (list of dicts):
            - content of dicts:
                - data_source_id (int): id of data source of which removal failed
                - code (int):
                    8 -- data source not existing
                    9 -- data source not registered for this user
                    14 -- access token for this data source and user not found
                    15 -- privacy levels for this data source and user not found
                    16 -- granularities for this data source and user not found
                    99 -- undefined
                - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = True
    for source in data_sources:
        remove_result = remove_data_source_data(user_id, source['data_source_id'], source['data_source_name'])
        if remove_result['success'] is False:
            if 'error' not in result:
                result['error'] = []
            if 'error' in remove_result:
                error = remove_result['error']
                error['data_source_id'] = source['data_source_id']
                result['error'].append(error)
            result['success'] = False
    result['response'] = {}
    return result


@celery.shared_task
def get_granularity(user_id, data_source_id):
    """ Return current upload granularity (= distance between timestamps of succeeding data points) for a
        specific data source.

    Args:
        - user_id (int): uid of user
        - data_source_id (int): id of data source to get information about

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid session token
                16 -- granularities for this data source and user not found
                99 -- undefined
            - message (str): error code meaning including query information
        - response (int): upload interval in milliseconds

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    # check if user token was correct
    session = db.get_db_session()
    try:
        data = session.query(UploadGranularity).filter_by(user_id=user_id, data_source_id=data_source_id).order_by(UploadGranularity.timestamp.desc()).first()
        session.close()
        if data is None:
            error = {}
            error['code'] = enums.Error.GRANULARITY_NOT_IN_DB
            error['message'] = "Granularity for this data source and user not found"
            result['error'] = error
        else:
            response = data.interval
            result['success'] = True
            result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()


@celery.shared_task
def list_granularities(user_id, data_source_ids=None):
    """ Return upload granularities for all registered sources if data_sources is None
    and only for the data sources contained by ID in data_sources if data_sources otherwise.

    Args:
        - user_id (int): uid of user
        - user_token (str): user session token
        - data_source_ids (list of int): ids of data sources to get information about

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1  -- invalid session token
                99 -- undefined
            - message (str): error code meaning including query information
        - response (list of dicts):
            - content of dicts:
                - data_source (int): data source id
                - interval (int): upload interval in millisecionds

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    # check if user token was correct
    session = db.get_db_session()
    try:
        if data_source_ids is None:
            granularity_list = session.query(UploadGranularity).filter_by(user_id=user_id).order_by(
                UploadGranularity.timestamp.desc()).all()
        else:
            granularity_list = session.query(UploadGranularity).filter(
                UploadGranularity.user_id == user_id,
                UploadGranularity.data_source_id.in_(data_source_ids)
            ).order_by(
                UploadGranularity.timestamp.desc()
            ).all()
        session.close()
        response = [
            {"data_source": row.data_source_id, "interval": row.interval}
            for row in granularity_list
        ]
        result['success'] = True
        result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def set_granularity(user_id, data_source_id, interval=60000):
    """Update upload granularity for a specific data source. Default: every minute.


    Args:
        - user_id (int): uid of user
        - data_source_id (int): id of data source to get information about
        - interval (int): interval in milliseconds

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid session token
                99 -- undefined
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """

    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        new_upload_granularity = UploadGranularity(
            user_id,
            data_source_id,
            int(round(time.time() * 1000)),
            interval
        )
        session.add(new_upload_granularity)
        session.commit()
        session.close()
        result['success'] = True
        result['response'] = {}
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def get_access_token(user_id, data_source_id):
    """ Return access token for a retrieving data of a specific data source for the user with the passed user id.

    Args:
        - user_id (int): uid of user
        - data_source_id (int): id of data source to get information about

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid session token
                14 -- access token for this data source and user not found
                99 -- undefined
            - message (str): error code meaning including query information
        - response (str): access token

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        data = session.query(AccessToken).filter(AccessToken.user_id == user_id).filter(
            AccessToken.data_source_id == data_source_id).first()
        session.close()
        if data is None:
            error = {}
            error['code'] = enums.Error.ACCESS_TOKEN_NOT_IN_DB
            error['message'] = "Access token for this data source and user not found"
            result['error'] = error
        else:
            response = data.token
            result['success'] = True
            result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def list_access_tokens(user_id, data_source_ids):
    """ Return access tokens for all registered sources if data_source_ids is None
        and only for the data sources contained by ID in data_source_ids if data_source_ids otherwise.

    Args:
        - user_id (int): uid of user
        - user_token (str): user session token
        - data_source_ids (list of int): ids of data sources to get information about

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1  -- invalid session token
                99 -- undefined
            - message (str): error code meaning including query information
        - response (list of dicts):
            - content of dicts:
                - data_source (int): data source id
                - token (str): access token

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    # check if user token was correct
    session = db.get_db_session()
    try:
        if data_source_ids is None:
            access_token_list = session.query(AccessToken).filter_by(user_id=user_id).all()
        else:
            access_token_list = session.query(AccessToken).filter(AccessToken.user_id == user_id). \
                filter(AccessToken.data_source_id.in_(data_source_ids)).all()
        session.close()
        response = [
            {"data_source": row.data_source_id, "token": row.token}
            for row in access_token_list
        ]
        result['success'] = True
        result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def set_access_token(user_id, data_source_id, access_token):
    """ Update access token for a specific data source.

    Args:
        - user_id (int): uid of user
        - data_source_id (int): id of data source to get information about
        - access_token (str): access token of the user for the data source

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid session token
                99 -- undefined
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        data = session.query(
            AccessToken
        ).filter_by(
            data_source_id=data_source_id,
            user_id=user_id
        ).all()
        for element in data:
            element.token = access_token
        session.commit()
        session.close()
        result['success'] = True
        response = {}
        result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def get_data_source_privacy_level(user_id, data_source_id):
    """ Return current privacy settings for a specific data source for the user with the passed user id.

    Args:
        - user_id (int): uid of user
        - data_source_id (int): id of data source to get information about

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid session token
                13 -- Privacy level for this data source and user not found
                99 -- undefined
            - message (str): error code meaning including query information
        - response (list of dicts):
            - content of dicts:
                - attribute (str): attribute name
                - label (str): attribute category
                - level (int): privacy level

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        data = session.query(
            PrivacySetting,
            AvailableDataSource
        ).filter(
            PrivacySetting.user_id == user_id,
            PrivacySetting.data_source_id == AvailableDataSource.data_source_id
        ).filter(
            PrivacySetting.data_source_id == data_source_id
        ).all()
        session.close()
        if data == []:
            error = {}
            error['code'] = enums.Error.PRIVACY_LEVEL_NOT_IN_DB
            error['message'] = "Privacy level for this data source and user not found"
            result['error'] = error
        else:
            response = [
                {
                    "attribute": row.PrivacySetting.attribute,
                    "label": UserDataType(
                        HelperMethods.tablename_to_source(
                            row.AvailableDataSource.data_source_name
                        ).label.get(
                            row.PrivacySetting.attribute
                        )
                    ),
                    "level": row.PrivacySetting.level,
                    "explicitconsent": row.PrivacySetting.explicitconsent
                }
                for row in data
            ]
            result['success'] = True
            result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def list_data_source_privacy_levels(user_id, data_source_ids=None):
    """ Return current privacy levels for all registered sources if data_sources is None
        and only for the data sources contained by ID in data_sources if data_sources otherwise.

    Args:
        - user_id (int): uid of user
        - user_token (str): user token
        - data_source_ids (list of int): ids of data sources to get information about

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1  -- invalid session token
                99 -- undefined
            - message (str): error code meaning including query information
        - response (list of dicts):
            - content of dicts:
                - datasource (int): data source id
                - attribute (str): attribute name
                - label (str): attribute category
                - level (int): privacy level

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        if data_source_ids is None:
            privacy_setting_list = session.query(
                PrivacySetting,
                AvailableDataSource
            ).filter(
                PrivacySetting.user_id == user_id,
                PrivacySetting.data_source_id == AvailableDataSource.data_source_id
            ).all()
        else:
            privacy_setting_list = session.query(
                PrivacySetting,
                AvailableDataSource
            ).filter(
                PrivacySetting.user_id == user_id,
                PrivacySetting.data_source_id == AvailableDataSource.data_source_id
            ).filter(
                PrivacySetting.data_source_id.in_(data_source_ids)
            ).all()
        session.close()

        response = [
            {
                "data_source": row.PrivacySetting.data_source_id,
                "attribute": row.PrivacySetting.attribute,
                "label": UserDataType(
                    HelperMethods.tablename_to_source(
                        row.AvailableDataSource.data_source_name
                    ).label.get(
                        row.PrivacySetting.attribute
                    )
                ),
                "level": row.PrivacySetting.level,
                "explicitconsent": row.PrivacySetting.explicitconsent,
            }
            for row in privacy_setting_list
        ]
        result['success'] = True
        result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def set_data_source_privacy_level(user_id, data_source_id, privacy_settings):
    """ Update access token for a specific data source.


    Args:
        - user_id (int): uid of user
        - user_token (str): user session token
        - data_source_id (int): id of data source to get information about
        - privacy_settings (dict):
            - content of dict:
                - attribute (str): attribute name
                - level (int): privacy level


    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid session token
                98 -- Privacy level out of bounds
                99 -- undefined
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """

    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        # Only allow privacy settings between 0 and 3 for now
        for privacy in privacy_settings:
            data = session.query(
                PrivacySetting
            ).filter_by(
                data_source_id=data_source_id,
                user_id=user_id,
                attribute=privacy.get("attribute")
            ).all()
            cur_level = privacy.get("level")
            if cur_level in range(0, 3 + 1):
                for element in data:
                    element.level = privacy.get("level")
                    element.explicitconsent = privacy.get("explicitconsent")
            else:
                session.rollback()
                session.close()
                error = {}
                error['code'] = enums.Error.INVALID_PRIVACY_LEVEL
                error['message'] = "Privacy level out of bounds"
                result['error'] = error
                return result
        session.commit()
        session.close()
        result['success'] = True
        result['response'] = {}
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def set_all_data_source_privacy_levels(user_id, privacy_setting):
    """ Set privacy levels of all attributes of all data sources to the passed value.


    Args:
        - user_id (int): uid of user
        - user_token (str): user session token
        - privacy_setting (dict): dict of level and explicitconsent


    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid session token
                98 -- Privacy level out of bounds
                99 -- undefined
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        # Only allow privacy levels between 0 and 3 for now
        data = session.query(
            PrivacySetting
        ).filter_by(
            user_id=user_id
        ).all()
        privacy_level = privacy_setting.get("level")
        privacy_explicit_consent = privacy_setting.get("explicitconsent")
        if privacy_level in range(0, 3 + 1):
            for element in data:
                element.level = privacy_level
                element.explicitconsent = privacy_explicit_consent
        else:
            session.rollback()
            session.close()
            error = {}
            error['code'] = enums.Error.INVALID_PRIVACY_LEVEL
            error['message'] = "Privacy level out of bounds"
            result['error'] = error
            return result
        session.commit()
        session.close()
        result['success'] = True
        result['response'] = {}
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def get_available_data_source_list():
    """ Return a list of currently available data sources.

    Args:

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                99 -- undefined
            - message (str): error code meaning including query information
        - result (list of dicts):
            - content of dicts:
                - data_source_id (int): data source id
                - data_source_name (str): data source name

        Example result value:
        [
            {
                'data_source_id': 1,
                'data_source_name': 'facebook'
            },
            {
                'data_source_id': 2,
                'data_source_name': 'strava'
            },
            ...
        ]

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        data_source_list = session.query(AvailableDataSource).all()
        response = []
        for element in data_source_list:
            element_dict = {}
            element_dict["data_source_id"] = element.data_source_id
            element_dict["data_source_name"] = element.data_source_name
            response.append(element_dict)
        result['success'] = True
        result['response'] = response
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result


@celery.shared_task
def add_data_point(uuid, data_source_type, data_point):
    """ Add new data point of specific data source to database.

    Args:
        - uuid (int): user unique identifier
        - data_source_type (str): type of data source (and therefore of data)
        - data_point (dict): data (timestamp and values for dynamic attributes)

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid session token
                99 -- undefined
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    session = db.get_db_session()
    result = {'success': False}

    # Determine what data we got and create object to insert into database

    data = json.loads(data_point['data'])

    try:
        if data_source_type.lower() == "openhabsensor":
            data_point_obj = OpenhabSensor(
                uuid,
                data['timestamp'],
                data['sensor_name'],
                data['data_type'],
                data['value']
            )

        elif data_source_type.lower() == "personalinformation":
            data_point_obj = PersonalInformation(
                uuid,
                data['timestamp'],
                data['user_name'],
                data['first_name'],
                data['last_name'],
                data['street'],
                data['city'],
                data['zip_code'],
                data['country'],
                data['birthday'],
                data['email'],
                data['gender']
            )

        elif data_source_type.lower() == "randomdata":
            data_point_obj = RandomData(
                uuid,
                data['timestamp'],
                float(data['random_one']),
                float(data['random_two'])
            )

        elif data_source_type.lower() == "iris":
            data_point_obj = Iris(
                uuid,
                data['timestamp'],
                float(data['sepal_length']),
                float(data['sepal_width']),
                float(data['petal_length']),
                float(data['petal_width']),
                data['iris_class']
            )

    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.close()
        error = {
            'code': enums.Error.UNDEFINED,
            'message': "Error! Are you sure a data source of type {} exists?".format(
                data_source_type
            )
        }
        result['error'] = error
        return result

    try:
        session.add(data_point_obj)
        session.commit()
        session.close()
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.UNDEFINED, 'message': "Unknown error occured."}
        result['error'] = error
        return result
    result['success'] = True
    result['response'] = {}
    return result


@celery.shared_task
def add_data(user_id, data_source_name, data):
    """ Add new data points of specific data source to database.

    Args:
        - user_id (int): user unique identifier
        - data_source_name (string): name of data source
        - data (list of dicts): data (timestamp and values for dynamic attributes)

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid session token
                99 -- undefined
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    session = db.get_db_session()
    result = {'success': False}
    # Determine what data we got and create object to insert into database
    if 'data' in data:
        data = data['data']
    else:
        session.rollback()
        session.close()
        error = {'code': enums.Error.NO_DATA_GIVEN, 'message': "No data was given which could be uploaded!"}
        result['error'] = error
        return result
    try:
        for data_point in data:
            data_point_obj = HelperMethods.classname_to_source(data_source_name)(user_id=user_id)
            data_point_obj.user_id = user_id
            for key in data_point.keys():
                setattr(data_point_obj, key, data_point[key])
            session.add(data_point_obj)
        try:
            session.commit()
            session.close()
        except Exception:
            if Configuration.test_mode:
                logging.exception("An error occured:")
            session.rollback()
            session.close()
            error = {'code': enums.Error.UNDEFINED, 'message': "Unknown error occured."}
            result['error'] = error
            return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.close()
        error = {'code': enums.Error.NO_SUCH_DATA_SOURCE, 'message': "No data source with name {} exists!".format(data_source_name)}
        result['error'] = error
        return result

    result['success'] = True
    result['response'] = {}
    return result


@celery.shared_task
def add_data_points(data_points):
    """ Internal function for testing to add new data points of specific data source to database for testing and without checking any requirements.

    Args:
        - data_points (list of dicts): data (timestamp and values for dynamic attributes)

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                99 -- undefined
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    session = db.get_db_session()
    result = {}
    result['success'] = False
    try:
        for data_point in data_points:
            session.add(data_point)
        session.commit()
        session.close()
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "undefined"
        result['error'] = error
        return result
    result['success'] = True
    result['response'] = {}
    return result


@celery.shared_task
def get_data(uuid, data_source_name, interval_begin, interval_end):
    """ Return stored data points for a specific data source for the user with the passed user id.

    Args:
        - uuid (int): uid of user
        - data_source_name (str): name of data source to get data from
        - interval_begin (int): timestamp of start of time frame for which to get data
        - interval_end (int): timestamp of start of time frame for which to get data

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid session token
                99 -- undefined
            - message (str): error code meaning including query information
        - response (list of dicts):
            - content of dicts:
                - data_source_ide (int): id of data source
                - user_id (int): id of user
                - timestamp (int) timestamp of data point
                - value (str): value of data point

        (returns error only if success == False and response otherwise)
    """
    session = db.get_db_session()
    result = {'success': False}
    data_source_object = HelperMethods.tablename_to_source(data_source_name)
    try:
        out = session.query(
            data_source_object
        ).filter_by(
            user_id=uuid
        ).filter(
            data_source_object.timestamp >= interval_begin
        ).filter(
            data_source_object.timestamp <= interval_end
        )
        out = out.all()
        session.close()
        result['success'] = True
        result['response'] = [o.as_dict() for o in out]
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.UNDEFINED, 'message': "Unknown error occured."}
        result['error'] = error
        return result


@celery.shared_task
def upload_data_bulk(uuid, data_source_type, data_points):
    """Add new data points of specific data source to database.

    Args:
        - uuid (int): uid of user
        - data_source_type (str): type of data, e.g., openhabsensor or personalinformation
        - data_points (dict): data points to upload

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                1 -- invalid token
                8 -- no such data source
                99 -- undefined
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    session = db.get_db_session()
    result = {'success': False}

    # Determine what data we got and create object to insert into database
    data_items = (data_points['data'])
    data_point_obj = []

    try:
        if data_source_type.lower() == "openhabsensor":
            for data_item in data_items:
                data = json.loads(data_item)
                data_point_obj.append(
                    OpenhabSensor(
                        uuid,
                        data['timestamp'],
                        data['sensor_name'],
                        data['data_type'],
                        data['value']
                    )
                )

        elif data_source_type.lower() == "personalinformation":
            for data_item in data_items:
                data = json.loads(data_item)
                data_point_obj.append(
                    PersonalInformation(
                        uuid,
                        data['timestamp'],
                        data['user_name'],
                        data['first_name'],
                        data['last_name'],
                        data['street'],
                        data['city'],
                        data['zip_code'],
                        data['country'],
                        data['birthday'],
                        data['email'],
                        data['gender']
                    )
                )

        elif data_source_type.lower() == "randomdata":
            for data_item in data_items:
                data = json.loads(data_item)
                data_point_obj.append(
                    RandomData(
                        uuid,
                        data['timestamp'],
                        float(data['random_one']),
                        float(data['random_two'])
                    )
                )

        elif data_source_type.lower() == "iris":
            for data_item in data_items:
                data = json.loads(data_item)
                data_point_obj.append(
                    Iris(
                        uuid,
                        data['timestamp'],
                        float(data['sepal_length']),
                        float(data['sepal_width']),
                        float(data['petal_length']),
                        float(data['petal_width']),
                        data['iris_class']
                    )
                )

        else:
            session.close()
            error = {'code': enums.Error.NO_SUCH_DATA_SOURCE, 'message': "No datasource with type {} exists!".format(data_source_type)}
            result['error'] = error
            return result

    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.close()
        error = {'code': enums.Error.UNDEFINED, 'message': "Unknown error occured."}
        result['error'] = error
        return result

    try:
        session.bulk_save_objects(data_point_obj)
        session.commit()
        session.close()
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {'code': enums.Error.UNDEFINED, 'message': "Unknown error occured."}
        result['error'] = error
        return result
    result['success'] = True
    result['response'] = {}
    return result


@celery.shared_task
def remove_data_points(user_id, data_source_name):
    """ Remove all data points belonging to a specific data source and user.

    Args:
        - user_id (int): user id
        - data_source_name (str): data source name

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                99 -- undefined
            - message (str): error code meaning including query information
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    try:
        session = db.get_db_session()
        # remove actual data points
        data_source_object = HelperMethods.tablename_to_source(data_source_name)
        data_points = session.query(data_source_object).filter_by(user_id=user_id).all()
        for element in data_points:
            session.delete(element)

        session.commit()
        session.close()
        result['success'] = True
        result['response'] = {}
        return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.UNDEFINED
        error['message'] = "Unknown error occured."
        result['error'] = error
        return result
