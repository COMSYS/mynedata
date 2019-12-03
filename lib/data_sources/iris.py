""" This module defines the structure of data items corresponding to the Iris Dataset. """

from sqlalchemy import Column, Integer, String, Float
from lib.data_structures import UserDataType
from lib.data_structures import BaseObject


class Iris(BaseObject):
    """ Evaluation data source Iris Dataset. """
    __tablename__ = 'iris'

    user_id = Column(Integer, primary_key=True)
    timestamp = Column(Integer, primary_key=True)

    sepal_length = Column(Float)
    sepal_width = Column(Float)
    petal_length = Column(Float)
    petal_width = Column(Float)
    iris_class = Column(String)

    def __init__(self, user_id, timestamp, sepal_length, sepal_width, petal_length, petal_width, iris_class):
        self.user_id = user_id
        self.timestamp = timestamp
        self.sepal_length = sepal_length
        self.sepal_width = sepal_width
        self.petal_length = petal_length
        self.petal_width = petal_width
        self.iris_class = iris_class

    def __repr__(self):
        return "<Iris(user_id='%s', timestamp='%i', sepal_length='%f', sepal_width='%f', petal_length='%f', petal_width='%f', iris_class='%s')>" % (
            self.user_id,
            self.timestamp,
            self.sepal_length,
            self.sepal_width,
            self.petal_length,
            self.petal_width,
            self.iris_class
        )

    def as_dict(self):
        """ Return dictionary representation of data item. """
        ret = {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}
        ret.pop('user_id', None)
        return ret

    label = {
        "sepal_length": UserDataType.SMART_HOME,
        "sepal_width": UserDataType.SMART_HOME,
        "petal_length": UserDataType.SMART_HOME,
        "petal_width": UserDataType.SMART_HOME,
        "iris_class": UserDataType.SMART_HOME
    }
