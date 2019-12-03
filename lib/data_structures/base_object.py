""" Definition of a base object for database-backed objects. """

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import orm

BaseObject = declarative_base()

SqlAlchemyException = orm.exc
