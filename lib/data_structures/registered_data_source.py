""" Module to define which data sources where registered by which
    user """

from sqlalchemy import Column, Integer
from . import BaseObject


class RegisteredDataSource(BaseObject):
    """ Associtiation of data source to user having it registered. """
    __tablename__ = 'registered_data_sources'

    data_source_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, primary_key=True)
    timestamp = Column(Integer)

    def __init__(self, data_source_id, user_id, timestamp):
        self.data_source_id = data_source_id
        self.user_id = user_id
        self.timestamp = timestamp

    def __repr__(self):
        return "RegisteredDataSource(data_source_id='%i', user_id='%i', timestamp='%i')" % (
            self.data_source_id,
            self.user_id,
            self.timestamp
        )
