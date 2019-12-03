""" This module defines a wrapper for SQLAlchemy. """

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from lib.data_structures import BaseObject


class DatabaseConnector():
    """ Wrapper for SQLAlchemy. """

    session = None
    initialized = False

    @staticmethod
    def initialize(target):
        """ Initialize SQLAlchemy wrapper. """
        engine = create_engine(target, echo=False)
        BaseObject.metadata.bind = engine
        BaseObject.metadata.create_all(engine, checkfirst=True)

        Session = sessionmaker(bind=engine)
        DatabaseConnector.session = Session()

        DatabaseConnector.initialized = True


def get_db_session():
    """ Get current session. """
    if not DatabaseConnector.initialized:
        raise RuntimeError('DatabaseConnector is not yet initialized!')
    return DatabaseConnector.session


def add_data_to_database(data):
    """ This function enables to commit data to the database. """

    if not DatabaseConnector.initialized:
        raise RuntimeError('DatabaseConnector is not yet initialized!')

    DatabaseConnector.session.add(data)
    DatabaseConnector.session.commit()
