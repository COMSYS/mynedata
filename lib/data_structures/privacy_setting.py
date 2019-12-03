""" Module to store the privacy levels chosen by users for processing
    their data (per data source and attribute) """

from sqlalchemy import Column, Integer, String, Boolean
from . import BaseObject


class PrivacySetting(BaseObject):
    """ Database representation of privacy settings. """
    __tablename__ = 'privacy_levels'

    data_source_id = Column(Integer, primary_key=True)
    attribute = Column(String, primary_key=True)
    user_id = Column(Integer, primary_key=True)
    level = Column(Integer)
    explicitconsent = Column(Boolean)

    def __init__(self, data_source_id, attribute, user_id, level, explicitconsent):
        self.data_source_id = data_source_id
        self.attribute = attribute
        self.user_id = user_id
        self.level = level
        self.explicitconsent = explicitconsent

    def __repr__(self):
        return "PrivacySetting(data_source_id='%i', attribute='%s', user_id='%i', level='%i', explicitconsent='%s')" % (
            self.data_source_id,
            self.attribute,
            self.user_id,
            self.level,
            self.explicitconsent
        )
