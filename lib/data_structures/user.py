""" This module defines the database representation of a user. """

import hashlib

from sqlalchemy import Column, Integer, String, Boolean
from . import BaseObject


class User(BaseObject):
    """ Database representation of a user. """
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True)
    username = Column(String)
    password_hash = Column(String)
    btc_address = Column(String)
    balance = Column(Integer)
    wizard_state = Column(Boolean)

    def __init__(self, uuid, username, password_hash, btc_address="none", wizard_state=False):
        self.user_id = uuid
        self.username = username
        self.password_hash = password_hash
        self.btc_address = btc_address
        self.balance = 0
        self.wizard_state = wizard_state

    def __repr__(self):
        return "<User(user_id='%s', username='%s', password_hash='%s', btc_address='%s', balance='%s', wizard_state='%s')>" % (
            self.user_id,
            self.username,
            self.password_hash,
            self.btc_address,
            self.balance,
            self.wizard_state
        )

    @staticmethod
    def derive_uid(name):
        """ Function to get the corresponding uid of a username

        Args:
            - name (string): name of user

        Returns:
            - int: uid of name
        """
        name_utf8 = name.encode('utf-8')
        uid = int(hashlib.sha256(name_utf8).hexdigest()[:5], 16)
        return uid
