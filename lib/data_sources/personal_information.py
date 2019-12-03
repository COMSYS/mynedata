""" We also represent personal information as a (potential) data source
    to facilitate querys over such data (e.g., average age of social
    media users). """

from sqlalchemy import Column, Integer, String, Boolean
from lib.data_structures import UserDataType
from lib.data_structures import BaseObject


class PersonalInformation(BaseObject):
    """ Representation of one user's personal information. """
    __tablename__ = 'personal_information'

    user_id = Column(Integer, primary_key=True)
    timestamp = Column(Integer, primary_key=True)
    user_name = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    street = Column(String)
    city = Column(String)
    zip_code = Column(String)
    country = Column(String)
    birthday = Column(String)  # '[year]/[month]/[day]', e.g. '1990/04/30'
    email = Column(String)
    gender = Column(String)  # {'male','female'}
    anon = Column(Boolean)

    def __init__(
            self,
            user_id=-1,
            timestamp=-1,
            user_name="",
            first_name="",
            last_name="",
            street="",
            city="",
            zip_code="",
            country="",
            birthday="",
            email="",
            gender="",
            anon=False
    ):
        self.user_id = user_id
        self.timestamp = timestamp
        self.user_name = user_name
        self.first_name = first_name
        self.last_name = last_name
        self.street = street
        self.city = city
        self.zip_code = zip_code
        self.country = country
        self.birthday = birthday
        self.email = email
        self.gender = gender
        self.anon = anon

    def __repr__(self):
        return "<PersonalInformation(user_id='%s', timestamp='%i', user_name='%s', first_name='%s', last_name='%s', street='%s', city='%s', zip_code='%s', country='%s', birthday='%s', email='%s', gender='%s', anon='%i')>" % (
            self.user_id,
            self.timestamp,
            self.user_name,
            self.first_name,
            self.last_name,
            self.street,
            self.city,
            self.zip_code,
            self.country,
            self.birthday,
            self.email,
            self.gender,
            self.anon
        )

    def as_dict(self):
        """ Dictionary representation. """
        ret = {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}
        ret.pop('user_id', None)
        return ret

    label = {
        "user_id": UserDataType.PERSONAL,
        "timestamp": UserDataType.PERSONAL,
        "user_name": UserDataType.PERSONAL,
        "first_name": UserDataType.PERSONAL,
        "last_name": UserDataType.PERSONAL,
        "street": UserDataType.PERSONAL,
        "city": UserDataType.PERSONAL,
        "zip_code": UserDataType.PERSONAL,
        "country": UserDataType.PERSONAL,
        "birthday": UserDataType.PERSONAL,
        "email": UserDataType.PERSONAL,
        "gender": UserDataType.PERSONAL,
        "anon": UserDataType.PERSONAL
    }
