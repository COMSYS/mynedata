""" Module to define which data sources are available """

from sqlalchemy import Column, Integer, String
from . import BaseObject


class AvailableDataSource(BaseObject):
    """ Representation of an available data source. """
    __tablename__ = 'available_data_sources'

    data_source_name = Column(String, primary_key=True)
    data_source_id = Column(Integer, primary_key=True)

    def __init__(self, data_source_name, data_source_id):
        self.data_source_name = data_source_name
        self.data_source_id = data_source_id

    def __repr__(self):
        return "AvailableDataSource(data_source_name='%s', data_source_id='%i')" % (
            self.data_source_name,
            self.data_source_id
        )
