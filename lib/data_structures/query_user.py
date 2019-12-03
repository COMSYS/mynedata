""" Module to store the status of queries in dependence of the users
    to be asked for their consent + storing of the users' relevant
    attribute settings """

from sqlalchemy import Column, Integer, String, Enum as DbEnum
from lib.data_structures import QueryState
from . import BaseObject


class QueryUser(BaseObject):
    """ Database representation of a user's view on a query. """
    __tablename__ = 'query_user'

    user_id = Column(Integer, primary_key=True)
    proc_id = Column(Integer, primary_key=True)
    query_id = Column(Integer, primary_key=True)
    consent = Column(DbEnum(QueryState))
    settings = Column(String)

    def __init__(self, user_id, proc_id, query_id, consent, settings):
        self.user_id = user_id
        self.proc_id = proc_id
        self.query_id = query_id
        self.consent = consent
        self.settings = settings

    def __repr__(self):
        return "QueryUser(user_id='%i', proc_id='%i', query_id='%i', consent='%s', settings='%s')" % (
            self.user_id,
            self.proc_id,
            self.query_id,
            self.consent,
            self.settings
        )
