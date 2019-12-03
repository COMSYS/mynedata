""" Source for random data for showcase and testing purposes. """

from sqlalchemy import Column, Integer, Float
from lib.data_structures import UserDataType
from lib.data_structures import BaseObject


class RandomData(BaseObject):
    """ Source representing random data. """
    __tablename__ = 'random_data'

    user_id = Column(Integer, primary_key=True)
    timestamp = Column(Integer, primary_key=True)
    random_one = Column(Float)
    random_two = Column(Float)

    def __init__(self, user_id=-1, timestamp=-1, random_one=-1.0, random_two=-1.0):
        self.user_id = user_id
        self.timestamp = timestamp
        self.random_one = random_one
        self.random_two = random_two

    def __repr__(self):
        return "RandomData(user_id='%s', timestamp='%i', random_one='%f', random_two='%f' )" % (
            self.user_id,
            self.timestamp,
            self.random_one,
            self.random_two
        )

    def as_dict(self):
        """ Dictionary representation. """
        ret = {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}
        ret.pop('user_id', None)
        return ret

    label = {
        "random_one": UserDataType.SMART_HOME,
        "random_two": UserDataType.LOCATION
    }
