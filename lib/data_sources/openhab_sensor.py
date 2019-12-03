""" Definition of data items corresponding to OpenHAB sensor readings. """

from sqlalchemy import Column, Integer, String
from lib.data_structures import UserDataType
from lib.data_structures import BaseObject


class OpenhabSensor(BaseObject):
    """ A single sensor reading. """
    __tablename__ = 'openhab_sensor'

    user_id = Column(Integer, primary_key=True)
    timestamp = Column(Integer, primary_key=True)
    sensor_name = Column(String, primary_key=True)
    data_type = Column(String)
    value = Column(String)  # String was chosen to remain flexible

    def __init__(self, user_id=-1, timestamp=-1, sensor_name="", data_type="", value=-1.0):
        self.user_id = user_id
        self.timestamp = timestamp
        self.sensor_name = sensor_name
        self.data_type = data_type
        self.value = value

    def __repr__(self):
        return "<OpenhabSensor(user_id='%s', timestamp='%i', sensor_name='%s', data_type='%s', value='%s')>" % (
            self.user_id,
            self.timestamp,
            self.sensor_name,
            self.data_type,
            self.value
        )

    def as_dict(self):
        """ Representation as dictionary. """
        ret = {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}
        ret.pop('user_id', None)
        return ret

    label = {
        "sensor_name": UserDataType.SMART_HOME,
        "data_type": UserDataType.SMART_HOME,
        "value": UserDataType.SMART_HOME
    }
