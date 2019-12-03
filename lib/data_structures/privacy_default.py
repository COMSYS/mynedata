""" Module to store the privacy levels chosen by users for processing
    their data (per data source and attribute) """

from sqlalchemy import Column, Integer, Boolean, Enum as DbEnum
from lib.data_structures import UserDataType
from . import BaseObject


class PrivacyDefault(BaseObject):
    """ Database representation of privacy level choices. """
    __tablename__ = 'privacy_defaults'

    label = Column(DbEnum(UserDataType), primary_key=True)
    user_id = Column(Integer, primary_key=True)
    level = Column(Integer)
    explicitconsent = Column(Boolean)

    def __init__(self, label, user_id, level, explicitconsent):
        self.label = label
        self.user_id = user_id
        self.level = level
        self.explicitconsent = explicitconsent

    def __repr__(self):
        return "PrivacyDefault(label='%i', user_id='%i', level='%i', explicitconsent='%s')" % (
            self.label,
            self.user_id,
            self.level,
            self.explicitconsent
        )
