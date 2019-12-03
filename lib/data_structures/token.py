""" This module defines a basic token. """

import time
import logging
from jose import JWTError, ExpiredSignatureError, jwt

from sqlalchemy import Column, Integer, String
from . import BaseObject
from . import User


logging.basicConfig(level=logging.DEBUG)

def _current_timestamp():
    """ Get a simple representation of "now". """
    return int(time.time())


class JwtToken(BaseObject):
    """ Database representation of a basic token. """
    __tablename__ = 'token'

    user_id = Column(Integer, primary_key=True)
    token = Column(String)

    def __init__(self, uuid, token):
        self.user_id = uuid
        self.token = token

    def __repr__(self):
        return "<User(user_id='%s', token='%s', )>" % (
            self.user_id,
            self.token
        )

    @staticmethod
    def generate_token(user_id, source_type):
        """ Generate a JWT to allow datacourse to upload on behalf of user

        Args:
            - username (str)
            - source_id: (str)

        Returns:
            - JWT token: (str)
            - emptyString: (str)
              (return emptyString only if generation failed)
        """
        # check correct login of user here
        JWT_LIFETIME_SECONDS = 600
        timestamp = _current_timestamp()
        payload = {
            "iss": 'Mynedata',
            "iat": timestamp,
            "exp": timestamp + JWT_LIFETIME_SECONDS,
            "sub": str(user_id),
            "source": str(source_type),
            "scope": "user",
        }

        return jwt.encode(payload, 'jwtsecret', algorithm='HS256')

    @staticmethod
    def generate_general_token(user_id, scope=None):
        """ Create an authentication token. """
        JWT_LIFETIME_SECONDS = 600
        token_scopes = list()
        token_scopes.append('everyone')
        if scope is None:
            pass
        elif scope in ['user', 'processor']:
            token_scopes.append(scope)
        elif isinstance(scope, list):
            token_scopes += scope
        else:
            raise ValueError('Invalid token scope.')
        timestamp = _current_timestamp()
        payload = {
            "iss": 'Mynedata',
            "iat": timestamp,
            "exp": timestamp + JWT_LIFETIME_SECONDS,
            "sub": str(user_id),
            "purpose": "general",
            "scope": ' '.join(token_scopes),
        }

        jwttoken = jwt.encode(payload, 'jwtsecret', algorithm='HS256')
        return JwtToken(user_id, jwttoken)

    @staticmethod
    def decode_token(user_id, token):
        """ Decode an authentication token. """
        try:
            tok = jwt.decode(
                token,
                'jwtsecret',
                subject=str(user_id),
                issuer='Mynedata',
                algorithms=['HS256']
            )
            return tok
        except ExpiredSignatureError:
            result = {}
            result['success'] = False
            result['error'] = 'expired-signature'
            return result
        except JWTError as e:
            result = {}
            result['success'] = False
            result['error'] = 'invalid-credentials'
            return result

    @staticmethod
    def check_token(tok, user_id, scope=None):
        """ Check validity of an authentication token. """
        try:
            token = JwtToken.decode_token(user_id, tok)
            token['scope'] = token['scope'].split(' ')
            # Special case: 'everyone' scope takes any user name
            validity_condition = (token['purpose'] == 'general' and scope in token['scope'])
            if scope != 'everyone':
                validity_condition = (token['sub'] == str(user_id) and validity_condition)
            return validity_condition
        except Exception as e:
            return False
