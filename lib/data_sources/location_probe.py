""" This module defines data items corresponding to location probes. """

from sqlalchemy import Column, Integer, Float
from lib.data_structures import UserDataType
from lib.data_structures import BaseObject


class LocationProbe(BaseObject):
    """ A single location probe. """
    __tablename__ = 'location_probe'

    user_id = Column(Integer, primary_key=True)
    timestamp = Column(Integer, primary_key=True)
    accuracy = Column(Float)
    altitude = Column(Integer)

    def __init__(self, user_id=-1, timestamp=-1, accuracy=-1.0, altitude=-1):
        self.user_id = user_id
        self.timestamp = timestamp
        self.accuracy = accuracy
        self.altitude = altitude

    def __repr__(self):
        return "RandomData(user_id='%i', timestamp='%i', accuracy='%f', altitude='%i' )" % (
            self.user_id,
            self.timestamp,
            self.accuracy,
            self.altitude
        )

    def as_dict(self):
        """ Dictionary representation of a location probe. """
        ret = {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}
        ret.pop('user_id', None)
        return ret

    label = {
        "accuracy": UserDataType.LOCATION,
        "altitude": UserDataType.LOCATION
    }
