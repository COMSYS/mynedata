""" Module to store the status of queries in dependence of the users
    to be asked for their consent + storing of the users' relevant
    attribute settings """

from sqlalchemy import Column, Integer
from . import BaseObject


class QueryUserMapping(BaseObject):
    """ Mapping of users to queries. """
    __tablename__ = 'query_user_mapping'

    id = Column(Integer, primary_key=True)
    query_id = Column(Integer)
    user_id = Column(Integer)
    paid = Column(Integer)
    proc_id = Column(Integer)

    def __init__(self, user_id, proc_id, query_id, paid):
        self.user_id = user_id
        self.proc_id = proc_id
        self.query_id = query_id
        self.paid = paid

    def __repr__(self):
        return "QueryUserMapping(user_id='%i', proc_id='%i', query_id='%i', paid='%s', id='%s')" % (
            self.user_id,
            self.proc_id,
            self.query_id,
            self.paid,
            self.id
        )
