""" This module defines the database representation of a PIN query. """

from sqlalchemy import Column, Integer, String
from . import BaseObject


class Pin_Query_Db(BaseObject):
    """ Database representation of a PIN query. """
    __tablename__ = 'pin_query_db'

    processor_id = Column(Integer, primary_key=True)
    query_id = Column(Integer, primary_key=True)
    query = Column(String)
    pin = Column(Integer)
    session_id = Column(Integer)
    query = Column(String)
    consent_start_time = Column(Integer)
    consent_finish_time = Column(Integer)
    state = Column(String)
    result = Column(String)

    def __init__(self, processor_id, query_id, query, pin, session_id, consent_start_time, consent_finish_time, state, result):
        self.processor_id = processor_id
        self.query_id = query_id
        self.query = query
        self.pin = pin
        self.session_id = session_id
        self.query = query
        self.consent_start_time = consent_start_time
        self.consent_finish_time = consent_finish_time
        self.state = state
        self.result = result

    def __repr__(self):
        return "Pin_Query('%i', '%i', '%s', '%i', '%i', '%i', '%i', '%s', '%s')" % (
            self.processor_id,
            self.query_id,
            self.query,
            self.pin,
            self.session_id,
            self.consent_start_time,
            self.consent_finish_time,
            self.state,
            self.result
        )
