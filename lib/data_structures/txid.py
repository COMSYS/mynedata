""" This module defines the database representation of a (Bitcoin) transaction ID. """

from sqlalchemy import Column, Integer, String
from . import BaseObject


class Txid(BaseObject):
    """ Database representation of a (Bitcoin) transaction ID. """
    __tablename__ = 'txid'
    id = Column(Integer, primary_key=True)
    tx_id = Column(String(250))
    query_id = Column(Integer)
    proc_id = Column(Integer)

    def __init__(self, tx_id, query_id, proc_id):
        self.query_id = query_id
        self.tx_id = tx_id
        self.proc_id = proc_id

    def __repr__(self):
        return "<Txid(query_id='%s', tx_id='%s', )>" % (
            self.query_id,
            self.tx_id
        )
