""" Collection of enumerations to increase code readability. """

from enum import Enum, IntEnum


class QueryState(str, Enum):
    """ Current state of data processor queries. """

    PENDING = 'pending'
    ABORTED = 'aborted'
    COMPLETED = 'completed'
    PROCESSING = 'processing'
    ACCEPTED = 'accepted'
    REFUSED = 'refused'
    ABANDONED = 'abandoned'
    PAID = 'paid'


class OrganizationType(str, Enum):
    """ Categories of data processor affiliations for privacy management. """

    SCIENCE = "science"
    GOVERNMENT = "government"
    GER_EU_ORG = "german_eu_org"
    INTERNATIONAL_ORG = "international_org"
    BANKS_INSURANCE = "banks_insurance"
    EV_NGO = "vereine_ngo"
    PRIVATE = "private_person"


class UserDataType(str, Enum):
    """ Categories of user data types for privacy management. """

    PERSONAL = 'personal'
    LOCATION = 'location'
    MEDICAL = 'medical'
    SMART_HOME = 'smart_home'
    ONLINE_ACTIVITY = 'online_activity'
    CONSUMER = 'consumer'
    BELIEF_DEPRECATED = 'belief'
    LIVING_DEPRECATED = 'living'
    FAMILY_DEPRECATED = 'family'
    FINANCE_DEPRECATED = 'finance'


class PaymentMethod(str, Enum):
    """ Different available payment methods. """

    NONE = 'none'
    DUMMY = 'dummy'
    BITCOIN_DIRECT = 'bitcoin_direct'
    BITCOIN_QUERY_BASED = 'bitcoin_query_based'
    BITCOIN_CENTRAL = 'bitcoin_central'


class Error(IntEnum):
    """ Definition of error codes. """

    NO_TOKEN = 0
    INVALID_TOKEN = 1
    EXISTING_QUERY_ID_PROC_ID_COMBINATION = 2
    CANNOT_REMOVE_USER = 3
    INVALID_PASSWORD = 4
    USER_NOT_IN_DB = 5
    USER_ALREADY_EXISTS = 6
    DATA_SOURCE_UUID_ALREADY_EXISTS = 7
    NO_SUCH_DATA_SOURCE = 8
    DATA_SOURCE_NOT_REGISTERED = 9
    PROCESSOR_ALREADY_EXISTS = 10
    PROCESSOR_NOT_IN_DB = 11
    CANNOT_REMOVE_PROCESSOR = 12
    INVALID_PRIVACY_LEVEL = 13
    ACCESS_TOKEN_NOT_IN_DB = 14
    PRIVACY_LEVEL_NOT_IN_DB = 15
    GRANULARITY_NOT_IN_DB = 16
    CANNOT_REMOVE_PERSONAL_INFORMATION = 17
    CANNOT_REMOVE_DATA_POINTS = 18
    QUERY_NOT_IN_DB = 19
    CANNOT_REMOVE_PRIVACY_DEFAULTS = 20
    ERROR_WHILE_ADDING_DATA_TO_DB = 21
    CANNOT_REMOVE_USER_QUERIES = 22
    CANNOT_REMOVE_PROC_QUERIES = 23
    CANNOT_PROCESS_QUERY = 24
    QUERY_ALREADY_PAID = 25
    QUERY_NOT_READY = 26
    MISSING_TRANSACTION_ID = 27
    QUERY_NOT_RETRIEVABLE = 28
    INSUFFICIENT_AMOUNT = 29
    PROFILE_NOT_FOUND = 30
    NO_DATA_GIVEN = 31
    INVALID_QUERY = 32
    UNDEFINED = 99
