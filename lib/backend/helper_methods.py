""" This module contains general helper methods. """
import importlib
import re
import logging

from lib.config import Configuration
from lib.data_structures.base_object import SqlAlchemyException


class HelperMethods():
    """ Static helper methods. """

    @staticmethod
    def str_to_attr(attr_string, source_class):
        """ Get attribute name of data source from string which helps to create dynamic queries

        Args:
        - attr_string(string): string containing data source class attribute name """
        # taken from https://stackoverflow.com/a/13808375
        return getattr(source_class, attr_string)

    @staticmethod
    def tablename_to_source(class_string):
        """ Get class of data source from string which helps to create dynamic queries

        Args:
        - class_string(string): string containing data source table name, e.g. 'random_data' """
        split_string = class_string.split('_')
        class_name = ''
        for s in split_string:
            class_name = class_name + s[:1].upper() + s[1:]
        module = importlib.import_module('lib.data_sources.' + class_string)
        # taken from https://stackoverflow.com/a/13808375
        return getattr(module, class_name)

    @staticmethod
    def classname_to_source(class_name):
        """ Get class of data source from string which helps to create dynamic queries

        Args:
        - class_name (string): string containing data source class name, e.g. 'RandomData' """
        split_string = re.sub(r"([A-Z])", r" \1", class_name).split()
        class_string = ''
        for s in split_string:
            class_string = class_string + s[:1].lower() + s[1:] + "_"
        class_string = class_string[:-1]
        module = importlib.import_module('lib.data_sources.' + class_string)
        # taken from https://stackoverflow.com/a/13808375
        return getattr(module, class_name)

    @staticmethod
    def classname_to_tablename(class_name):
        """ Get name of data source table (e.g. 'random_data') from string which helps to create dynamic queries

        Args:
        - class_string(string): string containing data source class name, e.g. 'RandomData' """
        split_string = re.sub(r"([A-Z])", r" \1", class_name).split()
        class_string = ''
        for s in split_string:
            class_string = class_string + s[:1].lower() + s[1:] + "_"
        class_string = class_string[:-1]
        return class_string

    @staticmethod
    def check_token(db_session, tokenobj, **param):
        """ This method checks that a requested token is in the database. """
        token = HelperMethods.retrieve_token(db_session, tokenobj, **param)
        return token is not None

    @staticmethod
    def retrieve_token(db_session, tokenobj, **param):
        """ This method checks that a requested token is in the database. """
        try:
            token_to_check = db_session.query(tokenobj).filter_by(**param).one_or_none()
            return token_to_check
        except SqlAlchemyException.MultipleResultsFound:
            if Configuration.test_mode:
                logging.exception("Token check reveiled ambiguous token!")
            db_session.close()
            return None

    @staticmethod
    def check_authorization(db, param, tokenobj):
        """ This function enables to check the existence of the passed user-token
            without repeating the following lines in every function which requires authorization. """

        session = db.get_db_session()
        is_authorized = HelperMethods.check_token(session, tokenobj, **param)
        return is_authorized
