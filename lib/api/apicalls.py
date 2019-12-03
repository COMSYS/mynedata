""" This module implements the handover between API and backend. """


import json

import connexion

# needed because eval() will instantiate a Datum object in get_data
from lib.backend.tasks.payment import tasks as payment_tasks
from lib.backend.tasks.data_source import tasks as data_source_tasks
from lib.backend.tasks.user import tasks as user_tasks
from lib.backend.tasks.query import tasks as query_tasks
from lib.data_structures import QueryState
from lib.data_structures import User, Processor
from lib.data_structures import JwtToken

call_timeout = 10
call_timeout_long = 30


def add_available_data_source(source_type, source_id):
    """ Debug function to add new data sources on the fly.

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
    result = data_source_tasks.add_available_data_source.delay(source_type, int(source_id))
    return result.get(timeout=call_timeout)


# path: /user/{username}/unregister method: POST
def unregister_user(username, passw):
    """ Function to unregister a user.

    Args:
        - username (str): name of user to be unregistered

        - passw (dict of str:str): contains the user's password

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
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        pw = passw['password']
        result = user_tasks.user_remove.delay(uuid, pw)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['error'] = "Invalid Credentials"
        result['success'] = False
        return result, 401


# path: /user/{username}/register method: POST
def register_user(username, user_data):
    """ Function to register a new user.

    Args:
        - username (str): name of user to be unregistered.

        - user_data (dict of str:str): contains the user's personal information.

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
    uuid = User.derive_uid(username)
    firstname = user_data['firstname'] if 'firstname' in user_data else ""
    lastname = user_data['lastname'] if 'lastname' in user_data else ""
    birthday = user_data['birthday']
    street = user_data['street'] if 'street' in user_data else ""
    postal = user_data['postal'] if 'postal' in user_data else ""
    city = user_data['city'] if 'city' in user_data else ""
    country = user_data['country']
    email = user_data['email']
    gender = user_data['gender'] if 'gender' in user_data else ""
    password = user_data['password']
    if 'anon' in user_data:
        anon = user_data['anon']
    else:
        if 'firstname' in user_data:
            anon = False
        else:
            anon = True
    if 'btc_address' in user_data:
        btc_address = user_data['btc_address']
    else:
        btc_address = 'none'
    result = user_tasks.user_register.delay(
        uuid,
        username,
        firstname,
        lastname,
        birthday,
        street,
        postal,
        city,
        country,
        email,
        gender,
        password,
        btc_address,
        anon
    )
    res = result.get(timeout=call_timeout)
    if "error" in res:
        return res, 400
    return res


# path: /user/{username}/register method: PATCH
def update_user(username, user_data):
    """ Function to update personal user data.

    Args:
        - username (str): name of user to be updated.

        - user_data (dict of str:str): contains the user's personal information.

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
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        firstname = user_data['firstname']
        lastname = user_data['lastname']
        birthday = user_data['birthday']
        street = user_data['street']
        postal = user_data['postal']
        city = user_data['city']
        country = user_data['country']
        email = user_data['email']
        gender = user_data['gender']
        password = user_data['password']
        result = user_tasks.user_update.delay(
            uuid,
            username,
            firstname,
            lastname,
            birthday,
            street,
            postal,
            city,
            country,
            email,
            gender,
            password
        )
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/login method: POST
def login_user(username, passw):
    """ Function to log in a  user and create and return a session token.

    Args:
        - username (str): name of user to be unregistered

        - passw (dict of str:str): contains the user's desired password

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
    pw = passw['password']
    uuid = User.derive_uid(username)
    result = user_tasks.check_login.delay(uuid, pw)
    res = result.get(timeout=call_timeout)
    if res:
        token = user_tasks.finish_user_login(uuid)
        if token is None:
            result = {}
            result['success'] = False
            result['error'] = 'Could not fetch login token.'
            return result, 500
        result = {}
        result['success'] = True
        result['response'] = {'mynedata-token': token}
        return result
    else:
        result = {}
        result['success'] = False
        result['error'] = "Invalid Credentials"
        return result, 401


# path: /user/{username}/logout method: POST
def logout_user(username):
    """ Function to log out a user and invalidate his session token.

    Args:
        - username (str): name of user to be unregistered

        - token (dict of str:str): contains the user's session token.

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1 -- invalid token
                99 -- undefined
            - message (str): error code meaning
        - response (empty dict)

        (returns error only if success == False and response otherwise)

    """

    tok = connexion.request.headers['mynedata-token']
    user_id = User.derive_uid(username)
    if JwtToken.check_token(tok, user_id, scope='user'):
        result = {}
        result['success'] = True
        return result
    else:
        result = {}
        result['error'] = "Invalid Credentials"
        result['success'] = False
        return result, 401


# path: /user/{username}/profile method: GET
def get_profile_user(username):
    """ Function to retrieve a user's profile information.

    Args:
        - username (str): name of user to be unregistered

        - token (dict of str:str): contains the user's session token.

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

        (returns error only if success == False and response otherwise)

        Example::

            {
                "firstname" : "bob",
                "lastname" : "testuser",
                "username" : "bob"
                ...
            }

    """
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = user_tasks.get_user_profile.delay(uuid)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data_source_privacy method: GET
def get_data_source_privacy_user(username):
    """ Return current privacy levels for all registered sources if data_sources is None
        and only for the data sources contained by ID in data_sources if data_sources otherwise.

    Args:
        - username (str)

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
    tok = connexion.request.headers['mynedata-token']
    uid = User.derive_uid(username)
    if JwtToken.check_token(tok, uid, scope='user'):
        result = data_source_tasks.list_data_source_privacy_levels.delay(uid, None)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data_source_privacy method: PATCH
def set_data_source_privacy_user(username, privacy_setting):
    """ Set privacy levels of all attributes of all data sources to the passed value.


    Args:
        - username (str)
        - data_source_privacy_level (int): privacy level to which all settings should be set


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
    tok = connexion.request.headers['mynedata-token']
    uid = User.derive_uid(username)
    if JwtToken.check_token(tok, uid, scope='user'):
        result = data_source_tasks.set_all_data_source_privacy_levels.delay(uid, privacy_setting)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data_source_privacy method: GET
def get_default_privacy_user(username):
    """ Return current default privacy settings for all attribute catgeories.

    Args:
        - username (str)

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
    tok = connexion.request.headers['mynedata-token']
    uid = User.derive_uid(username)
    if JwtToken.check_token(tok, uid, scope='user'):
        result = user_tasks.list_default_privacy_levels.delay(uid, None)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data_source_privacy method: PATCH
def set_default_privacy_user(username, default_privacy):
    """ Set the default privacy levels for a user

    Args:
        - username (str)

        - default_privacy (dict : list of (str : dict)): of form ``privacy_levels : [{"label":label, "level":level}]``

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
    tok = connexion.request.headers['mynedata-token']
    uid = User.derive_uid(username)
    if JwtToken.check_token(tok, uid, scope='user'):
        result = user_tasks.set_default_privacy_levels.delay(uid, default_privacy['privacy_levels'])
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /processor/{username}/unregister mehtod: POST
def unregister_processor(username, passw):
    """ Function to unregister a processor.

    Args:
        - username (str): name of processor to be unregistered

        - passw (dict of str:str): contains the processor's password

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

    tok = connexion.request.headers['mynedata-token']
    puid = Processor.derive_uid(username)
    if JwtToken.check_token(tok, puid, scope='processor'):
        pw = passw['password']
        result = user_tasks.proc_remove.delay(puid, pw, tok)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /processor/{username}/register method: POST
def register_processor(username, passw):
    """ Function to register a new processor.

    Args:
        - username (str): name of processor to be unregistered.

        - user_data (dict of str:str): contains the processor's personal information.

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
    puid = Processor.derive_uid(username)
    password = passw['password']
    result = user_tasks.proc_register.delay(puid, username, password)
    res = result.get(timeout=call_timeout)
    if "error" in res:
        return res, 400
    return res


# path: /processor/{username}/login method: POST
def login_processor(username, passw):
    """ Function to log in a processor and create and return a session token.

    Args:
        - username (str): name of processor to be unregistered

        - passw (dict of str:str): contains the processor's desired password

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
    pw = passw['password']
    puid = Processor.derive_uid(username)
    result = user_tasks.check_login.delay(puid, pw)
    res = result.get(timeout=call_timeout)
    if res:
        token = user_tasks.finish_proc_login(username)
        result = {}
        result['success'] = True
        result['response'] = {'mynedata-token': token}
        return result
    else:
        result = {}
        result['success'] = False
        result['error'] = "Invalid Credentials"
        return result, 401


# path: /processor/{username}/logout method: POST
def logout_processor(username):
    """ Function to log out a processor and invalidate his session token.

    Args:
        - username (str): name of processor to be unregistered

        - token (dict of str:str): contains the processor's session token.

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1 -- invalid password
                99 -- undefined
            - message (str): error code meaning
        - response (empty)

    """

    tok = connexion.request.headers['mynedata-token']
    puid = Processor.derive_uid(username)
    if JwtToken.check_token(tok, puid, scope='processor'):
        result = user_tasks.proc_logout.delay(puid)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /processor/{username}/profile method: GET
def get_processor_profile(username):
    """ Function for a data processor to retrieve own profile information.

    Args:
        - username (str): data processor name

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                21 -- Error, Profile not found even though user is registered
                99 -- Undefined
            - message (str): error code meaning
        - response (dict)
            - name (str)
            - address (str)
            - postcode (int)
            - city (str)
            - org_type (enums.OrganizationType)
            - thumbnail_url (str)

        (returns error only if success == False and response otherwise)

        Example::

            {
                "username": "bob",
                "email_address": "bob@mynedata.com",
                ...
            }
    """
    tok = connexion.request.headers['mynedata-token']
    if user_tasks.is_user(username):
        is_user = True
        uid = User.derive_uid(username)
        token_scope = 'user'
    else:
        is_user = False
        uid = Processor.derive_uid(username)
        token_scope = 'processor'
    if JwtToken.check_token(tok, uid, scope=token_scope):
        result = user_tasks.get_proc_profile.delay(uid, is_user=is_user)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: processor/{username}/profile method: POST
def set_profile_processor(username, processor_profile):
    """ Function to set a processor's profile information.

    Args:
        - username (str): name of user to be unregistered

        - user_profile (dict of str:str): contains the processor's profile.

    Returns:
        str: success if call was successful.

    Example input::

        user_profile:
        {
            "username": "bob",
            "email_address": "bob@mynedata.com",
            "token": "ABC"
        }

    """

    tok = connexion.request.headers['mynedata-token']
    uuid = Processor.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='processor'):
        result = user_tasks.set_processor_profile.delay(uuid, processor_profile)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /processor/{username}/privacy method: GET
def get_privacy_processor(username, _):
    """ Function to retrieve a processor's publicity settings.

    Args:
        - username (str): name of user to be unregistered

        - token (dict of str:str): contains the user's session token.

    Returns:
        dict of str: str: contains the user's privacy information.

    Example:

        {
            "username": "bob",
            "publicity_setting": "strict",
            "token": "ABC"
        }
    """

    tok = connexion.request.headers['mynedata-token']
    proc_id = Processor.derive_uid(username)
    if JwtToken.check_token(tok, proc_id, scope='everyone'):
        # FIXME Function does not exist!
        result = data_source_tasks.list_privacy_levels.delay(username, tok)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data_source method: GET
def list_data_sources(username, detail):
    """ Return a list of currently registered data sources for the user with the passed user id.

        Args:
            - username (str)
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
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.get_data_source_list.delay(uuid, detail)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path:/user/{username}/data_source/{source_id} method: POST
def register_data_source(username, source_id, parameters):
    """ Register a specific data source for a specific user. For this, different objects need to be created in the data base like privacy and upload granularity settings.

        Args:
            - username (str)
            - source_id (int): uid of the data source
            - parameters (dict):
                - access_token (str)
                - upload_granularity (int)
                - privacy_settings (list of dicts of str : int): attribute and privacy level

                Example:
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
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.add_data_source.delay(
            uuid,
            source_id,
            parameters['access_token'],
            int(parameters['upload_granularity']),
            parameters['privacy_settings'],
            None
        )
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path:/user/{username}/data_source method: POST
def get_data_source_information(username, source_id):
    """ Return information about a specific registered data source.

    Args:
        - username (str)
        - source_id (int): id of data source to get information about

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
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.get_data_source_information.delay(uuid, source_id)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data_source/{source_id} method: DELETE
def remove_data_source(username, source_id):
    """ Remove all information and data points belonging to a user and data source.

    Args:
        - username (str)
        - source_id (int): id of data source to remove information about

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
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.remove_data_source.delay(uuid, source_id)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data_source/{source_id}/privacy method: GET
def get_data_source_privacy(username, source_id):
    """ Return current privacy settings for a specific data source for the user with the passed user id.

    Args:
        - username (str)
        - source_id (int): id of data source to get information about

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
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.get_data_source_privacy_level.delay(uuid, source_id)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data_source/{source_id}/privacy method: PATCH
def set_data_source_privacy(username, source_id, data_source_privacy):
    """ Update access token for a specific data source.

    Args:
        - username (str)
        - source_id (int): id of data source to get information about
        - data_source_privacy (dict of str : list of dicts): { 'privacy_settings' : [{'attribute':attribute, 'level':level}] }


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
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.set_data_source_privacy_level.delay(
            uuid,
            source_id,
            data_source_privacy['privacy_settings']
        )
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data_source/{source_id}/granularity method: GET
def get_data_source_granularity(username, source_id):
    """ Return current upload granularity (= distance between timestamps of succeeding data points) for a
        specific data source.

    Args:
        - username (str)
        - source_id (int): id of data source to get information about

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
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.get_granularity.delay(uuid, source_id)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data_source/{source_id}/granularity method: PATCH
def set_data_source_granularity(username, source_id, granularity_setting):
    """ Update upload granularity for a specific data source. Default: every minute.

    Args:
        - username (str)
        - source_id (int): id of data source to get information about
        - granularity_setting (dict of str : int): { 'interval' : granularity }

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
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.set_granularity.delay(uuid, source_id, granularity_setting['interval'])
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data_source/{source_id}/granularity method: GET
def get_data_source_token(username, source_id):
    """ Return access token for a retrieving data of a specific data source for the user with the passed user id.

    Args:
        - username (str)
        - source_id (int): id of data source to get information about

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
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.get_access_token.delay(uuid, source_id)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data_source/{source_id}/access_token method: PATCH
def set_data_source_token(username, source_id, access_token):
    """ Update access token for a specific data source.

    Args:
        - username (str)
        - source_id (int): id of data source to get information about
        - access_token (dict of str : str): { 'value' : access_token }

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
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.set_access_token.delay(uuid, source_id, access_token['value'])
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def list_available_data_sources():
    """ Return a list of currently available data sources.

    Args:
        - username (str)

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
    result = data_source_tasks.get_available_data_source_list.delay()
    res = result.get(timeout=call_timeout)
    if "error" in res:
        return res, 400
    return res


# path: /user/{username}/data/{source_type} method: POST
def store_data(username, source_type, data):
    """ Add new data points of specific data source to database.

    Args:
        - username (str)
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
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.add_data.delay(uuid, source_type, data)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data/{source_type}/bulk method: POST
def store_bulk_data(username, source_type, data):
    """ Function to upload single data items for a user.
    Args:
        username (string): name of user
        source_type (string): type of data source (and data)
        data (dict of str:str): data

    Returns:
        string: info if upload was successful and error message otherwise
    """
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.upload_data_bulk.delay(uuid, source_type, data)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /user/{username}/data/{source_type}/bulk method: POST
def get_data(username, source_type, interval_begin, interval_end):
    """ Function to get all data items for a user in a time interval.
    Args:
        username (string): name of user
        source_type (string): type of data source (and data)
        data (dict of str:str): data

    Returns:
        string: info if upload was successful and error message otherwise
    """
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.get_data.delay(uuid, source_type, interval_begin, interval_end)
        res = result.get()
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def delete_data(username, source_type):
    """ Function to delete all data items for a user in a data source.
    Args:
        username (string): name of user
        source_type (string): type of data source (and data)

    Returns:
        - success (bool)
    """
    tok = connexion.request.headers['mynedata-token']
    uuid = User.derive_uid(username)
    if JwtToken.check_token(tok, uuid, scope='user'):
        result = data_source_tasks.remove_data_points.delay(uuid, source_type)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /processor/{username}/query: POST
def register_query(username, query_request):
    """ Check if processor is logged in then create entry in query db and return a query reply

    Args:
        - username (str): processor username
        - query_request (dict):
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
    tok = connexion.request.headers['mynedata-token']
    puid = Processor.derive_uid(username)
    if JwtToken.check_token(tok, puid, scope='processor'):
        query_id = query_request['query_id'] if "query_id" in query_request else -1
        query = query_request['query']
        if 'price' in query_request:
            price = query_request['price']
        else:
            price = 0
        if 'amount' in query_request:
            amount = query_request['amount']
        else:
            amount = 1
        granularity = query_request['granularity']
        interval_start_time = query_request['interval_start_time']
        if 'interval_finish_time' in query_request:
            interval_finish_time = query_request['interval_finish_time']
        else:
            interval_finish_time = query_request['interval_start_time']
        consent_start_time = query_request['consent_start_time']
        consent_finish_time = query_request['consent_finish_time']
        max_privacy = query_request['max_privacy']
        title = query_request['title'] if 'title' in query_request else "No title"
        description = query_request['description'] if 'description' in query_request else "No description"
        goal_description = query_request['goal_description'] if 'goal_description' in query_request else "No goal description"
        thumbnail_url = query_request['thumbnail_url'] if 'thumbnail_url' in query_request else "https://www.comsys.rwth-aachen.de/fileadmin/_processed_/csm_mynedata_a51489a7a9.png"
        state = QueryState.PENDING
        result = ''
        res = query_tasks.register_query.delay(
            puid,
            query_id,
            query,
            price,
            amount,
            interval_start_time,
            interval_finish_time,
            consent_start_time,
            consent_finish_time,
            granularity,
            max_privacy,
            state,
            result,
            title,
            description,
            goal_description,
            thumbnail_url
        )
        res = res.get(timeout=call_timeout_long)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /processor/{username}/check_query: POST
def check_query(username, query):
    """ Check syntax of a query. """
    tok = connexion.request.headers['mynedata-token']
    proc_id = Processor.derive_uid(usernam)
    if JwtToken.check_token(tok, proc_id, scope='processor'):
        res = query_tasks.check_query.delay(query["query"])
        res = res.get(timeout=call_timeout_long)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /processor/{username}/query: POST
def register_pin_query(username, pin_query_request):
    """ Check if processor is logged in then create entry in query db and return a query reply

    Args:
        - username (str): processor user name
        - pin_query_request:
            - query_id (int): query id, e.g. 5
            - session_id (int): id to separate processing for different users, if multiple participated
            - query (str): SQL query, e.g. "SELECT SUM(RandomData.random_two) WHERE PersonalInformation.city = aachen"
            - consent_start_time (int): from this point in time users can decide to participate in milliseconds. e.g. 1539124000000
            - consent_finish_time (int): up to this point of time users can decide to participate in milliseconds. e.g. 1539125800000

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

    tok = connexion.request.headers['mynedata-token']
    puid = Processor.derive_uid(username)
    if JwtToken.check_token(tok, puid, scope='processor'):
        query_id = pin_query_request['query_id'] if "query_id" in pin_query_request else -1
        session_id = pin_query_request['session_id'] if "session_id" in pin_query_request else -1
        query = pin_query_request['query']
        consent_start_time = pin_query_request['consent_start_time']
        consent_finish_time = pin_query_request['consent_finish_time']
        state = QueryState.PENDING
        result = ''
        res = query_tasks.register_pin_query.delay(
            puid,
            query_id,
            session_id,
            query,
            consent_start_time,
            consent_finish_time,
            state, result
        )
        res = res.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


# path: /processor/{username}/query: GET
def get_query_result(username, query_id):
    """ Get specific query result.

    Args:
        - username (str): name of user or processor
        - query_id (int)

    Returns:
        - success (bool)
        - error (dict):
            - code (int): one of
                1  -- invalid session token
                19 -- query was not in db
            - message (str): error code meaning
        - response (str): result
    """

    tok = connexion.request.headers['mynedata-token']
    if user_tasks.is_user(username):
        uid = User.derive_uid(username)
        token_scope = 'user'
        is_processor = False
    else:
        uid = Processor.derive_uid(username)
        token_scope = 'processor'
        is_processor = True

    if JwtToken.check_token(tok, uid, scope=token_scope):
        task_res = query_tasks.retrieve_query.delay(puid, tok, query_id, processor=is_processor)
        res = {}
        res['success'] = task_res['success']
        if task_res['success']:
            res['response'] = task_res['response']['result']
            return json.dumps(res)
        else:
            res['error'] = task_res['error']
            return json.dumps(res), 400
    else:
        result = {}
        result['success'] = False
        return result, 401


def get_proc_query(username, query_id):
    """ Get specific query which the processor posed.

    Args:
        - username (str): name of processor
        - query_ids (dict of str : int): query ids

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

    tok = connexion.request.headers['mynedata-token']
    proc_id = Processor.derive_uid(username)
    if JwtToken.check_token(tok, proc_id, scope='processor'):
        debugComputeAdhoc = 'debugComputeAdhoc' in connexion.request.headers.keys() and connexion.request.headers['debugComputeAdhoc']
        res = payment_tasks.check_payment.delay(proc_id, query_id, None, debugComputeAdhoc)
        res = res.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def get_proc_query_tid(username, query_id, transaction_id):
    """ Get specific query which the processor posed.

    Args:
        - username (str): name of processor
        - query_ids (dict of str : int): query ids

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

    tok = connexion.request.headers['mynedata-token']
    proc_id = Processor.derive_uid(username)
    if JwtToken.check_token(tok, proc_id, scope='processor'):
        res = payment_tasks.check_payment.delay(proc_id, query_id, transaction_id)
        res = res.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def set_payment_state(username, query_id):
    """ Update the current state of a pending payment. """

    tok = connexion.request.headers['mynedata-token']
    proc_id = Processor.derive_uid(username)
    if JwtToken.check_token(tok, proc_id, scope='processor'):
        res = payment_tasks.set_payment_state.delay(proc_id, query_id)
        res = res.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def get_proc_pin_query(username, query_id):
    """ Get specific pin query in which the user with the passed id participated or which was posed by this processor.

    Args:
        - username (str)
        - query_id (int)

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

    tok = connexion.request.headers['mynedata-token']
    proc_id = Processor.derive_uid(username)
    if JwtToken.check_token(tok, proc_id, scope='processor'):
        res = query_tasks.retrieve_pin_query.delay(proc_id, proc_id, query_id)
        res = res.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def get_pin_query_info(username, pin):
    """ Get information about pin_query (how the result would look like) before participation.

    Args:
        - username (str)
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

    tok = connexion.request.headers['mynedata-token']
    user_id = User.derive_uid(username)
    if JwtToken.check_token(tok, user_id, scope='user'):
        res = query_tasks.get_pin_query_info.delay(user_id, None, pin)
        res = res.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def get_user_query(username, query_id):
    """ Get specific query in which the user with the passed id participated.

    Args:
        - username (str): name of user
        - query_ids (dict of str : int): query_id (int) and proc_id (int)

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

    tok = connexion.request.headers['mynedata-token']
    user_id = User.derive_uid(username)
    if JwtToken.check_token(tok, user_id, scope='user'):
        res = query_tasks.retrieve_query.delay(user_id, None, query_id, False)
        res = res.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def list_proc_pin_queries(username, state):
    """ List all queries which were posed by the processor with the passed processor id and have the passed
        query state and list all queries by this processor if passed state is invalid.

    Args:
        - username (str): user name of processor
        - state (str): state of query = pending, aborted, completed, abandoned or processing

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

    tok = connexion.request.headers['mynedata-token']
    proc_id = Processor.derive_uid(username)
    if JwtToken.check_token(tok, proc_id, scope='processor'):
        res = query_tasks.get_proc_pin_queries.delay(proc_id, state)
        res = res.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def list_user_pin_queries(username, state):
    """ List all queries which were posed by the processor with the passed processor id and have the passed
        query state and list all queries by this processor if passed state is invalid.

    Args:
        - username (str): user name
        - state (str): state of query = pending, aborted, completed, abandoned or processing

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
    try:
        tok = connexion.requerst.headers['mynedata-token']
    except Exception:
        result = {}
        result['success'] = False
        return result, 401

    user_id = User.derive_uid(username)
    if JwtToken.check_token(tok, user_id, scope='user'):
        res = query_tasks.get_user_pin_queries.delay(user_id, state)
        res = res.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def list_proc_queries(username, state):
    """ List all queries which were posed by the processor with the passed processor id and have the passed
        query state and list all queries by this processor if passed state is invalid.

    Args:
        - username (str): user name of processor
        - state (str): state of query = pending, aborted, completed, abandoned or processing

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

    tok = connexion.request.headers['mynedata-token']
    proc_id = Processor.derive_uid(username)
    if JwtToken.check_token(tok, proc_id, scope='processor'):
        res = query_tasks.get_proc_queries.delay(proc_id, state)
        res = res.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def list_user_queries(username, state):
    """ List all queries with passed query and consent state for which a user was selected and
        list all queries for which a user was selected for invalid states.

    Args:
        - username (str)
        - state (str): "<query_state>+<consent_state>", with query_state one of pending, aborted, completed, abandoned or processing
            and consent_state one of pending, accepted or refused

            e.g. "completed+accepted"

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

    tok = connexion.request.headers['mynedata-token']
    user_id = User.derive_uid(username)
    if JwtToken.check_token(tok, user_id, scope='user'):
        if '+' in state:
            query_state = state.split('+')[0]
            consent_state = state.split('+')[1]
        else:
            query_state = ""
            consent_state = state
        res = query_tasks.get_user_queries.delay(user_id, query_state, consent_state)
        res = res.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def set_query_consent(username, state, query_ids):
    """ Change consent to participate in a query or not for the user with the passed id and
        the query with the passed processor and query ids.

    Args:
        - username (str)
        - state: can be 'accepted' or 'refused'
        - query_ids (dict of str : int): query_id (int) and proc_id (int)

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
    tok = connexion.request.headers['mynedata-token']
    user_id = User.derive_uid(username)
    if JwtToken.check_token(tok, user_id, scope='user'):
        query_id = query_ids['query_id']
        proc_id = query_ids['proc_id']
        accept = False
        if state == 'accepted':
            accept = True
        result = query_tasks.set_query_consent.delay(user_id, proc_id, query_id, accept)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def set_pin_query_consent(username, pin, pin_query_response):
    """ Change consent to participate in a pin query or not for the user with the passed id and
        the query with the passed pin.

    Args:
        - username (str)
        - pin (int): pin associated with the query
        - pin_query_response (dict of str : bool): {'accept' : accept} where accept is True or False

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
    tok = connexion.request.headers['mynedata-token']
    user_id = User.derive_uid(username)
    if JwtToken.check_token(tok, user_id, scope='user'):
        accept = bool(pin_query_response['accept'])
        result = query_tasks.set_pin_query_consent.delay(user_id, pin, accept)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def get_payment_info(username, query_id):
    """ Get information to pay the query. """
    tok = connexion.request.headers['mynedata-token']
    proc_id = Processor.derive_uid(username)
    if JwtToken.check_token(tok, proc_id, scope='processor'):
        result = payment_tasks.get_payment_info.delay(proc_id, query_id)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def has_done_wizard(username):
    """ Check whether the user has already concluded the privacy wizard. """
    tok = connexion.request.headers['mynedata-token']
    user_id = User.derive_uid(username)
    if JwtToken.check_token(tok, user_id, scope='user'):
        result = user_tasks.get_wizard_state.delay(user_id)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def set_wizard_done(username):
    """ Store that the user has concluded the privacy wizard. """
    tok = connexion.request.headers['mynedata-token']
    user_id = User.derive_uid(username)
    if JwtToken.check_token(tok, user_id, scope='user'):
        result = user_tasks.set_wizard_state.delay(user_id, True)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def set_wizard_done_devel(username, state):
    """ (Development function) Set state whether the user has concluded the privacy wizard.

        This gives the ability to unset the conclusion of the privacy wizard. """

    tok = connexion.request.headers['mynedata-token']
    user_id = User.derive_uid(username)
    if JwtToken.check_token(tok, user_id, scope='user'):
        result = user_tasks.set_wizard_state.delay(user_id, state["state"])
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    else:
        result = {}
        result['success'] = False
        return result, 401


def auth_store_bulk_data(source_type, data):
    """ Function to upload single data items for a user.
    Args:
        username (string): name of user
        source_type (string): type of data source (and data)
        data (dict of str:str): data

    Returns:
        string: info if upload was successful and error message otherwise
    """
    try:
        tok = connexion.requerst.headers['Authorization']
    except Exception:
        result = {}
        result['success'] = False
        return result, 401
    token = JwtToken.decode_token(tok)
    if token['source'] == source_type:
        result = data_source_tasks.upload_data_bulk.delay(int(token['sub']), source_type, data)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    result = {}
    result['success'] = False
    return result, 401


def auth_store_data(source_type, data):
    """ Store a data item from an authorized data source. """
    try:
        tok = connexion.request.headers['Authorization']
    except Exception:
        return "Missing Authorization token", 401
    token = JwtToken.decode_token(tok)
    if token['source'] == source_type:
        result = data_source_tasks.add_data.delay(int(token['sub']), source_type, data, True)
        res = result.get(timeout=call_timeout)
        if "error" in res:
            return res, 400
        return res
    return "Unauthorized", 401


def generate_token(username, source_type, passw):
    pw = passw['password']
    user_id = User.derive_uid(username)
    result = user_tasks.check_login.delay(user_id, pw)
    res = result.get(timeout=call_timeout)
    result = dict()
    result['success'] = False
    if res:
        result['success'] = True
        result['response'] = JwtToken.generate_token(user_id, source_type)
        return result
    else:
        result['error'] = "Unauthorized"
        return result, 401
