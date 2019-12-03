""" This module defines the database representation of a query. """

from sqlalchemy import Column, Integer, String, Enum as DbEnum
from lib.data_structures import QueryState
from . import BaseObject


class Query_Db(BaseObject):
    """ Database representation of a query. """
    __tablename__ = 'query_db'

    processor_id = Column(Integer, primary_key=True)
    query_id = Column(Integer, primary_key=True)
    query = Column(String)
    price = Column(Integer)
    interval_start_time = Column(Integer)
    interval_finish_time = Column(Integer)
    consent_start_time = Column(Integer)
    consent_finish_time = Column(Integer)
    amount = Column(Integer)
    granularity = Column(Integer)
    max_privacy = Column(Integer)
    state = Column(DbEnum(QueryState))
    result = Column(String)
    address = Column(String)
    title = Column(String)
    description = Column(String)
    goal_description = Column(String)
    usedDataTypes = Column(String)
    thumbnail_url = Column(String)

    def __init__(
            self,
            processor_id,
            query_id,
            query,
            price,
            interval_start_time,
            interval_finish_time,
            consent_start_time,
            consent_finish_time,
            amount,
            granularity,
            max_privacy,
            state,
            result,
            title,
            description,
            goal_description,
            usedDataTypes,
            thumbnail_url,
            address=None):
        self.processor_id = processor_id
        self.query_id = query_id
        self.query = query
        self.price = price
        self.interval_start_time = interval_start_time
        self.interval_finish_time = interval_finish_time
        self.consent_start_time = consent_start_time
        self.consent_finish_time = consent_finish_time
        self.amount = amount
        self.granularity = granularity
        self.max_privacy = max_privacy
        self.state = state
        self.result = result
        self.address = address
        self.title = title
        self.usedDataTypes = usedDataTypes
        self.description = description
        self.goal_description = goal_description
        self.thumbnail_url = thumbnail_url

    def __repr__(self):
        return "Query('%i', '%i', '%s', '%i', '%i', '%i', '%i', '%i', '%i', '%i', '%i', '%s', '%s', '%s', '%s', '%s', '%s', '%s')" % (
            self.processor_id,
            self.query_id,
            self.query,
            self.price,
            self.interval_start_time,
            self.interval_finish_time,
            self.consent_start_time,
            self.consent_finish_time,
            self.amount,
            self.granularity,
            self.max_privacy,
            self.state,
            self.result,
            self.address,
            self.description,
            self.goal_description,
            self.usedDataTypes,
            self.thumbnail_url
        )

    def as_dict(self):
        """ Dictionary representation. """
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
