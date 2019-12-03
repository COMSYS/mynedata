""" Module to store the how often data of one source is uploaded for
    a certain user in form of time intervals """

from sqlalchemy import Column, Integer
from . import BaseObject


class UploadGranularity(BaseObject):
    """ Database representation of a user's upload granularity. """
    __tablename__ = 'upload_granularities'

    user_id = Column(Integer, primary_key=True)
    data_source_id = Column(Integer, primary_key=True)
    timestamp = Column(Integer, primary_key=True)
    interval = Column(Integer)

    def __init__(self, user_id, data_source_id, timestamp, interval):
        self.user_id = user_id
        self.data_source_id = data_source_id
        self.timestamp = timestamp
        self.interval = interval

    def __repr__(self):
        return "UploadGranularity(user_id='%i', data_source_id='%i', timestamp='%i', interval='%i')" % (
            self.user_id,
            self.data_source_id,
            self.timestamp,
            self.interval
        )
