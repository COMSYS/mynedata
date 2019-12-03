""" Module to store tokens of each user to access the different data
    sources """

from sqlalchemy import Column, Integer, String
from . import BaseObject


class AccessToken(BaseObject):
    """ Representation of an access token. """
    __tablename__ = 'access_tokens'

    data_source_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, primary_key=True)
    token = Column(String)

    def __init__(self, data_source_id, user_id, token):
        self.data_source_id = data_source_id
        self.user_id = user_id
        self.token = token

    def __repr__(self):
        return "AccessToken(data_source_id='%i', user_id='%i', token='%s')" % (
            self.data_source_id,
            self.user_id,
            self.token
        )
