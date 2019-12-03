""" This module wraps all user management functionalities from
    storage.user.py in celery tasks.

    All functionality is encapsulated in the corresponding backend module. """
import hashlib
import time
import logging

import celery

from lib.config import Configuration
from lib.data_structures import enums
from lib.data_structures import QueryUser
from lib.data_structures import Query_Db
from lib.data_structures.available_data_source import AvailableDataSource
from lib.data_structures import UserDataType
from lib.data_structures.registered_data_source import RegisteredDataSource
from lib.data_structures.privacy_default import PrivacyDefault
from lib.data_structures.privacy_setting import PrivacySetting
from lib.data_structures import QueryState
from lib.data_sources import personal_information
from lib.backend import database as db
from lib.backend.helper_methods import HelperMethods
from lib.backend.tasks.data_source import tasks as data_source_tasks

from lib.data_structures import User, Processor
from lib.data_structures import JwtToken


Configuration.initialize()
db.DatabaseConnector.initialize(target=Configuration.database_uri)


def add_data_to_database(data):
    """ This function enables to commit data to the database
        without repeating the following three lines in every
        set-function. """
    session = db.get_db_session()
    session.add(data)
    session.commit()
    session.close()

def is_user(username):
    session = db.get_db_session()
    res = session.query(User).filter_by(**{'username': username}).one_or_none()
    session.close()
    return res is not None


@celery.shared_task
def check_login(user_id, passw):
    """ check password (internal)

    Args:
        - user_id (int): uid of the user

        - passw (str): password of the user

    Returns:
        - success (bool)
    """
    # FIXME: Add check for tokens
    session = db.get_db_session()
    try:
        # check if password was right
        account_to_check = session.query(User).filter_by(**{'user_id': user_id})
        if account_to_check.count() == 0:

            session.close()
            return False
        account_to_check = account_to_check.one()

        if account_to_check.password_hash == passw:
            session.close()
            return True
        session.close()
        return False
    except Exception:
        session.close()
        logging.exception("An error occured:")
        return False


def register(new_acc, db_query, pers_inf, param):
    """ Add new user to database. (internal)

    Args:
        - new_acc (object): User object to be added to database of type ``db_query``

        - db_query (class): User class, e.g. ``User``

        - pers_inf (object): Object of type personal_information.PersonalInformation

        - param (dict): Contains the user id, e.g. `` {'user_id': user_id} ``

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                - 6 -- Account already existing
                - 99 -- Undefined
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """

    session = db.get_db_session()
    result = {}
    result['success'] = False
    try:
        # account already registered
        if session.query(db_query).filter_by(**param).count():
            session.close()
            Configuration.print_config()
            error = {}
            error['code'] = enums.Error.USER_ALREADY_EXISTS
            error['message'] = "account already exists"
            result['error'] = error
            return result
        else:
            session.add(new_acc)
            if pers_inf is not None:
                session.add(pers_inf)
                for code in UserDataType:
                    session.add(PrivacyDefault(code.value, new_acc.user_id, 0, True))
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


def update(db_query_acc, db_query_inf, pers_inf, param):
    """ Update existing user profile. (internal)
        We deliberately use over-expressive error messages for the sake of
        our research demonstrator. In real deployments, this approach will
        leak sensitive information to attackers.

    Args:
        - db_query_acc (class): class of the user, e.g. ``User``

        - db_query_inf (class): class of the personal information, e.g. ``personal_information.PersonalInformation``

        - pers_inf (object): Object of type ``db_query_inf``

        - param (dict): Contains the user id, e.g. ``{'user_id': user_id}``

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                - 1 -- Token error
                - 6 -- Account does not exist
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    session = db.get_db_session()
    result = {}
    result['success'] = False
    try:
        # check if user exists and correct password
        session.update(db_query_inf).where(db_query_acc.user_id == param['user_id']).values(pers_inf)
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
        error['code'] = enums.Error.USER_NOT_IN_DB
        error['message'] = "account does not exist yet"
        result['error'] = error
        return result


def remove_personal_information(db_query_inf, param):
    """ Remove the personal infotmation (internal)

    Args:
        - db_query_inf (class): class of the personal information, e.g. ``personal_information.PersonalInformation``

        - param (dict): Contains the user id, e.g. ``{'user_id': user_id}``

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                - 17 -- Cannot remove personal information from database
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    session = db.get_db_session()
    result = {}
    result['success'] = False
    try:
        # try to remove personal information from db
        pers_inf_to_delete = session.query(db_query_inf).filter_by(**param).one()
        session.delete(pers_inf_to_delete)
        session.commit()
        session.close()
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.commit()
        session.close()
        error = {}
        error['code'] = enums.Error.CANNOT_REMOVE_PERSONAL_INFORMATION
        error['message'] = "cannot remove personal information from Db"
        result['error'] = error
        return result
    result['success'] = True
    result['response'] = {}
    return result


@celery.shared_task
def list_default_privacy_levels(user_id, labels=None):
    """ Return current default privacy settings for all attribute catgeories if labels is None
        and only for the passed categories (=labels) otherwise.

    Args:
        - user_id (int): uid of the user

    Kwargs:
        - labels (list of int): if not ``None``, only the levels for the matching labels will be returned

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                - 1 -- Invalid token
                - 99 -- Undefined
            - message (str): error code meaning
        - response (list of dicts):
            - form of dicts: ``{"label":label, "level":level}``

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    # check if user token was correct
    session = db.get_db_session()
    try:
        if labels is None:
            privacy_default_list = session.query(PrivacyDefault)\
                .filter(PrivacyDefault.user_id == user_id).all()
        else:
            privacy_default_list = session.query(PrivacyDefault).\
                filter(PrivacyDefault.user_id == user_id).\
                filter(PrivacyDefault.label.in_(labels)).all()
        session.close()
        response = [{"label": row.label,
                     "level": row.level,
                     "explicitconsent": row.explicitconsent} for row in privacy_default_list]
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
def set_default_privacy_levels(user_id, privacy_levels):
    """ Set the default privacy levels for a user

    Args:
        - user_id (int): uid of the user

        - privacy_levels (list of str : dict): Of form ``{"label":label, "level":level}``

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                - 1 -- Invalid token
                - 91 -- Privacy level out of bounds
                - 99 -- Undefined
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        registered_data_sources = session.query(AvailableDataSource).filter(AvailableDataSource.data_source_id == RegisteredDataSource.data_source_id).filter(RegisteredDataSource.user_id == user_id).all()
        for privacy_level in privacy_levels:
            # Only allow privacy levels between 0 and 3 for now
            if 0 <= privacy_level.get("level") <= 3:
                # set level in default table
                cur = session.query(PrivacyDefault).filter_by(user_id=user_id, label=privacy_level.get("label")).one()
                cur.level = privacy_level.get("level")
                cur.explicitconsent = privacy_level.get("explicitconsent")
                # check for every registered data source if some attribute has the same label and needs to be
                # updated
                for source in registered_data_sources:
                    source_class = HelperMethods.tablename_to_source(source.data_source_name)
                    for key in source_class.label:
                        if source_class.label.get(key) == privacy_level.get("label"):
                            privacy_setting = session.query(PrivacySetting).filter_by(data_source_id=source.data_source_id, user_id=user_id, attribute=key).one()
                            privacy_setting.level = privacy_level.get("level")
                            privacy_setting.explicitconsent = privacy_level.get("explicitconsent")
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


def remove_default_privacy(db_query_privacy, param):
    """ Remove the default privacy settings for a user (internal)

    Args:
        - db_query_privacy (class): class of the privacy information, e.g. ``PrivacyDefault``

        - param (dict): Contains the user id, e.g. ``{'user_id': user_id}``

    Returns:
        - success (bool)
        - error (dict):
            - code (int):
                - 19 -- cannot remove default privacy information from Db
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    session = db.get_db_session()
    result = {}
    result['success'] = False
    try:
        # try to remove default privacy settings from db
        default_privacy_to_delete = session.query(db_query_privacy).filter_by(**param).all()
        session.delete(default_privacy_to_delete)
        session.commit()
        session.close()
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        session.rollback()
        session.commit()
        session.close()
        error = {}
        error['code'] = enums.Error.CANNOT_REMOVE_PRIVACY_DEFAULTS
        error['message'] = "cannot remove default privacy information from Db"
        result['error'] = error
        return result
    result['success'] = True
    result['response'] = {}
    return result


def remove(user_id, passw, db_query_inf, db_query_privacy, db_query_queries, is_user, param):
    """ Remove account by its ID. (internal)

    Args:
        - user_id (int): uid of the user

        - passw (str): password hash of the user

        - db_query_inf (class): class of the personal information, e.g. ``personal_information.PersonalInformation``

        - db_query_privacy (class): class of the privacy information, e.g. ``PrivacyDefault``

        - db_query_queries (class): class of the query db, e.g. ``Query_Db``

        - db_query_pin_queries (class): class of the pin query db, e.g., ``Pin_Query_Db``

        - is_user (bool): if ``True``, get list of registered data sources and remove them

        - param (dict): Contains the user id, e.g. ``{'user_id': user_id}``

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                6  -- Account does not exists yet
                1  -- Token not found, user not logged in
                17 -- cannot remove personal information from Db
                19 -- cannot remove default privacy settings from Db
                22 -- cannot remove queries associated with user from Db
                23 -- cannot remove queries associated with processor from Db
                3 -- cannot remove account from Db
                4 -- invalid password
                5 -- account not in db
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """

    session = db.get_db_session()
    result = {}
    result['success'] = False
    try:
        # check if user exists and correct password
        db_query_acc = User if is_user else Processor
        account_to_check = session.query(db_query_acc).filter_by(**param).one()
        if account_to_check.password_hash == passw:
            # if user, get list of registered data sources and remove them
            if is_user:
                try:
                    # try to remove personal information & default privacy settings from db
                    pers_inf_to_delete = session.query(db_query_inf).filter_by(**param).one()
                    session.delete(pers_inf_to_delete)
                except Exception:
                    if Configuration.test_mode:
                        logging.exception("An error occured:")
                    session.rollback()
                    session.commit()
                    session.close()
                    error = {}
                    error['code'] = enums.Error.CANNOT_REMOVE_PERSONAL_INFORMATION
                    error['message'] = "cannot remove personal information from Db"
                    result['error'] = error
                    return result
                try:
                    # try to remove personal information & default privacy settings from db
                    default_privacy_to_delete = session.query(db_query_privacy).filter_by(**param).all()
                    for setting in default_privacy_to_delete:
                        session.delete(setting)
                except Exception:
                    if Configuration.test_mode:
                        logging.exception("An error occured:")
                    session.rollback()
                    session.commit()
                    session.close()
                    error = {}
                    error['code'] = enums.Error.CANNOT_REMOVE_PRIVACY_DEFAULTS
                    error['message'] = "cannot remove default privacy settings from Db"
                    result['error'] = error
                    return result
                try:
                    # try to remove associated queries
                    queries_to_delete = session.query(db_query_queries).filter_by(**param).all()
                    for query in queries_to_delete:
                        session.delete(query)
                except Exception:
                    if Configuration.test_mode:
                        logging.exception("An error occured:")
                    session.rollback()
                    session.commit()
                    session.close()
                    error = {}
                    error['code'] = enums.Error.CANNOT_REMOVE_USER_QUERIES
                    error['message'] = "cannot remove queries associated with user from Db"
                    result['error'] = error
                    return result
                session.commit()
                session.close()
                result['success'] = True
                result['response'] = {}
                data_sources = data_source_tasks.get_data_source_list(user_id, False)
                remove_result = data_source_tasks.remove_data_sources(user_id, data_sources['response'])
                if remove_result['success'] is False:
                    error = {}
                    error['code'] = enums.Error.UNDEFINED
                    error['message'] = "Undefined error while trying to remove data for user"
                    result['error'] = error
                    return result
            # log user/proc out
            else:
                logout_result = proc_logout(user_id)
                if not logout_result["success"]:
                    session.rollback()
                    session.close()
                    return logout_result
                try:
                    # change status of associated queries
                    queries_to_modify = session.query(db_query_queries).filter_by(processor_id=param['puid']).all()
                    for query in queries_to_modify:
                        query.state = QueryState.ABANDONED
                        query.result = ""
                except Exception:
                    if Configuration.test_mode:
                        logging.exception("An error occured:")
                    session.rollback()
                    session.commit()
                    session.close()
                    error = {}
                    error['code'] = enums.Error.CANNOT_REMOVE_PROC_QUERIES
                    error['message'] = "cannot remove queries associated with processor from Db"
                    result['error'] = error
                    return result
            try:
                # try to remove user from db
                account_to_delete = session.query(db_query_acc).filter_by(**param).one()
                session.delete(account_to_delete)
                session.commit()
                session.close()
                result['success'] = True
                result['response'] = {}
            except Exception:
                if Configuration.test_mode:
                    logging.exception("An error occured:")
                session.rollback()
                session.close()
                error = {}
                error['code'] = enums.Error.CANNOT_REMOVE_USER
                error['message'] = "cannot remove account from Db"
                result['error'] = error
            return result
        else:
            error = {}
            error['code'] = enums.Error.INVALID_PASSWORD
            error['message'] = "invalid password"
            result['error'] = error
            return result
    except Exception:
        if Configuration.test_mode:
            logging.exception("An error occured:")
        error = {}
        error['code'] = enums.Error.USER_NOT_IN_DB
        error['message'] = "account not in db"
        result['error'] = error
        return result


def finish_login(user_id, is_processor=False):
    """ check password and create token. (internal)

    Args:
        - user_id (int): uid of the user

        - passw (str): password of the user

        - db_query (class): class of the user, e.g. ``User``

        - param (dict): Contains the user id, e.g. ``{'user_id': user_id}``

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                4  -- Invalid password
                99 -- Undefined
            - message (str): error code meaning
        - response (str): user session token

        (returns error only if success == False and response otherwise)
    """
    session = db.get_db_session()

    # Password check is performed in apicalls using check_login()
    token_scope = 'processor' if is_processor else 'user'
    try:
        loggedin = session.query(JwtToken).filter(JwtToken.user_id == user_id)
        if loggedin.count():
            response = loggedin.one()
            validity_check = JwtToken.check_token(response.token, user_id, token_scope)
            if validity_check:
                return_token = response.token
                session.close()
            else:
                updated_token = JwtToken.generate_general_token(user_id, scope=token_scope)
                loggedin.update({JwtToken.token: updated_token.token})
                return_token = updated_token.token
                session.commit()
                session.close()
            return return_token

        new_token = JwtToken.generate_general_token(user_id, scope=token_scope)
        session.add(new_token)
        response = new_token.token
        session.commit()
        session.close()
        return response
    except Exception as e:
        return None


def logout(user_id):
    """ Old stub, JWT tokens just become invalid after a certain time.

    Args:

    Returns:
        - success (bool)
        - response (str)

        (returns error only if success == False and response otherwise)
    """
    # FIXME: Handle in-database tokens again
    result = {}
    result['success'] = True
    result['resonse'] = 'Tokens become invalid after a time automatically.'
    return result


""" User Section:
    This section contains all user related tasks:
    - add_user: Adds user to DB (register)
    - remove: remove user from DB (unregister)
    - login_user: genereate session token (login)
    - logout_user: invalidate token (logout) """


@celery.shared_task
def user_register(user_id, username, firstname, lastname, birthday, street, postal, city, country, email, gender, password_hash, btc_address, anon):
    """ Add new user to database.

    Args:
        - user_id (int): uid of the user

        - username (str): username of the user

        - firstname (str)

        - lastname (str)

        - birthday (str)

        - street (str)

        - postal (str)

        - city (str)

        - country (str)

        - email (str)

        - gender (str)

        - password_hash (str)

        -btc_address (str)

        -anon (bool)

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                6  -- Account already exists
                99 -- Undefined
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    new_user = User(user_id, username, password_hash, btc_address)
    session = db.get_db_session()
    new_personal_information = personal_information.PersonalInformation(
        user_id,
        int(round(time.time() * 1000)),
        username,
        firstname,
        lastname,
        street,
        city,
        postal,
        country,
        birthday,
        email,
        gender,
        anon
    )
    return register(new_user, User, new_personal_information, {'user_id': user_id})


@celery.shared_task
def user_update(user_id, username, firstname, lastname, birthday, street, postal, city, country, email, gender):
    """ Update user information.

    Args:
        - user_id (int): uid of the user

        - username (str): username of the user

        - firstname (str)

        - lastname (str)

        - birthday (str)

        - street (str)

        - postal (str)

        - city (str)

        - country (str)

        - email (str)

        - gender (str)

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1  -- Token not found, user not logged in
                6  -- Account does not exist yet
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    new_personal_information = personal_information.PersonalInformation(
        user_id,
        int(round(time.time() * 1000)),
        username,
        firstname,
        lastname,
        street,
        city,
        postal,
        country,
        birthday,
        email,
        gender,
        False
    )
    return update(
        User,
        personal_information.PersonalInformation,
        new_personal_information,
        {'user_id': user_id}
    )


@celery.shared_task
def user_remove(user_id, passw):
    """ Remove user by its ID.

    Args:
        - user_id (int): uid of the user

        - passw (str): password of the user

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                6  -- Account does not exists yet
                1  -- Token not found, user not logged in
                17 -- cannot remove personal information from Db
                19 -- cannot remove default privacy settings from Db
                22 -- cannot remove queries associated with user from Db
                23 -- cannot remove queries associated with processor from Db
                3 -- cannot remove account from Db
                4 -- invalid password
                5 -- account not in db
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    return remove(user_id, passw, personal_information.PersonalInformation, PrivacyDefault, QueryUser, is_user=True, param={'user_id': user_id})


@celery.shared_task
def finish_user_login(user_id):
    """ check password and create token.

    Args:
        - user_id (int): uid of the user

        - passw (str): password of the user

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                4 -- invalid password
                99 -- undefined
            - message (str): error code meaning
        - response (str): user session token

        (returns error only if success == False and response otherwise)
    """
    return finish_login(user_id, is_processor=False)


@celery.shared_task
def user_logout(user_id):
    """ Old stub, JWT tokens become invalid after a certain time.

    Args:

    Returns:
        - success (bool)
        - response (str)

        (returns error only if success == False and response otherwise)
    """
    return logout(user_id)


@celery.shared_task
def set_wizard_state(user_id, state):
    """ Set wizard state. """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        profile = session.query(User). \
            filter_by(user_id=user_id).one()
        profile.wizard_state = state
        session.commit()
        result['response'] = ""
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
def get_wizard_state(user_id):
    """ Get wizard state. """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        profile = session.query(User). \
            filter_by(user_id=user_id).one()
        result['response'] = profile.wizard_state
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
def get_proc_profile(proc_id, is_user=True):
    """ Get data processor profile. """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        profile = session.query(
            Processor
        ).filter_by(
            puid=proc_id
        ).one()
        response = {
            "name": profile.name,
            "address": profile.address,
            "postcode": profile.postcode,
            "city": profile.city,
            "org_type": profile.org_type,
            "thumbnail_url": profile.thumbnail_url
        }
        if profile == []:
            session.close()
            error = {}
            error['code'] = enums.Error.PROFILE_NOT_FOUND
            error['message'] = "Error, Profile not found even though user is registered."
            result['error'] = error
            return result
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
def set_processor_profile(user_id, processor_profile):
    """ Set data processor profile. """
    session = db.get_db_session()
    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        profile = session.query(Processor).filter_by(puid=user_id).one()
        if 'name' in processor_profile:
            profile.name = processor_profile['name']
        if 'address' in processor_profile:
            profile.address = processor_profile['address']
        if 'postcode' in processor_profile:
            profile.postcode = processor_profile['postcode']
        if 'city' in processor_profile:
            profile.city = processor_profile['city']
        if 'org_type' in processor_profile and processor_profile['org_type'] in [x.value for x in enums.OrganizationType]:
            profile.org_type = processor_profile['org_type']
        if 'thumbnail_url' in processor_profile:
            profile.thumbnail_url = processor_profile['thumbnail_url']
        session.commit()
        result['success'] = True
        result['response'] = ""
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
def get_user_profile(user_id):
    """ Returns the user profile

    Args:
        - user_id (int): uid of the user

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                21 -- Error, Profile not found even though user is registered
                99 -- Undefined
            - message (str): error code meaning
        - response (dict)
            - username (str)
            - firstname (str)
            - lastname (str)
            - birthday (str)
            - street (str)
            - postal (str)
            - city (str)
            - country (str)
            - email (str)
            - gender (str)
            -anon (bool)

        (returns error only if success == False and response otherwise)
    """

    result = {}
    result['success'] = False
    session = db.get_db_session()
    try:
        profile = session.query(personal_information.PersonalInformation). \
            filter_by(user_id=user_id).one()
        response = {}
        response['username'] = profile.user_name
        response['firstname'] = profile.first_name
        response['lastname'] = profile.last_name
        response['birthday'] = profile.birthday
        response['street'] = profile.street
        response['postal'] = profile.zip_code
        response['city'] = profile.city
        response['country'] = profile.country
        response['email'] = profile.email
        response['gender'] = profile.gender
        response['anon'] = profile.anon
        if profile == []:
            session.close()
            error = {}
            error['code'] = enums.Error.PROFILE_NOT_FOUND
            error['message'] = "Error, Profile not found even though user is registered."
            result['error'] = error
            return result
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


""" Data Processor
    data processor related tasks:
    - register_processor: register given processor in DB
    - remove_processor: unregister processor, delete entry in db
    - login_processor: create token for processor
    - logout_processor: invalidate token
"""


@celery.shared_task
def proc_register(proc_id, username, password_hash):
    """ Add new processor to database.

    Args:
        - proc_id (int): uid of the processor

        - processorname (str): username of the user

        - password_hash (str)

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                6  -- account already exists
                99 -- undefined
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    new_processor = Processor(proc_id, username, password_hash)
    return register(new_processor, Processor, None, {'puid': proc_id})


@celery.shared_task
def proc_remove(proc_id, passw):
    """ Remove processor by its ID.

    Args:
        - proc_id (int): uid of the processor

        - passw (str): password of the processor

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                6  -- Account does not exists yet
                1  -- Token not found, user not logged in
                17 -- cannot remove personal information from Db
                19 -- cannot remove default privacy settings from Db
                22 -- cannot remove queries associated with user from Db
                23 -- cannot remove queries associated with processor from Db
                3 -- cannot remove account from Db
                4 -- invalid password
                5 -- account not in db
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)
    """
    return remove(proc_id, passw, None, None, Query_Db, is_user=False, param={'puid': proc_id})


@celery.shared_task
def finish_proc_login(proc_id):
    """ check password and create token.

    Args:
        - proc_id (int): uid of the processor

        - passw (str): password of the processor

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                4 -- invalid password
                99 -- undefined
            - message (str): error code meaning
        - response (str): processor session token

        (returns error only if success == False and response otherwise)
    """
    return finish_login(proc_id, is_processor=True)


@celery.shared_task
def proc_logout(user_id):
    """ Old stub, JWT tokens just become invalid after a certain time.

    Args:

    Returns:
        - success (bool)
        - response (str)
    """
    return logout(user_id)
