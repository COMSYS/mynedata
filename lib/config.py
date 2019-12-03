""" This module handles constant, file-based, and runtime configuration. """
import configparser
from lib.data_structures import PaymentMethod


# CONSTANTS NEEDED FOR PREPROCESSING

# If more than this percentage of values is None
# no interpolation is applied but the whole data row is discarded.
INTERPOLATION_LIMIT = 0.21
# If there are no values for a longer
# time than this (in seconds), the data row is discarded.
MAX_INTERPOLATION_INTERVAL = 2 * 60 * 60

PrivacyParams = {
    1: {
        "k-anon": 1,
        "noise": 0.01,
        "diffpriv": 10
    },
    2: {
        "k-anon": 2,
        "noise": 0.05,
        "diffpriv": 5
    },
    3: {
        "k-anon": 3,
        "noise": 0.1,
        "diffpriv": 1
    }
}


class Configuration():
    """ Static class for handling configuration. """

    initialized = False
    parsed_config = configparser.ConfigParser()
    broker_heartbeat = 0

    @staticmethod
    def _readConfigEntry(section_key, entry_key, default=None):
        if section_key not in Configuration.parsed_config.keys():
            return default
        if entry_key not in Configuration.parsed_config[section_key].keys():
            return default
        return Configuration.parsed_config[section_key][entry_key]

    @staticmethod
    def initialize(configuration_filename='/mynedata/config.ini'):
        """ Initialize configuration based on config file. """

        if Configuration.initialized:
            print('CRITICAL: Already initialized configuration object. Ignoring updated information!')
            return
        else:
            import sys
            print('configuration object got initialized in {}'.format(sys.argv[0]))

        Configuration.parsed_config.read(configuration_filename)

        # Shared section
        key_shared = 'Shared'
        Configuration.broker_url = Configuration._readConfigEntry(key_shared, 'celery_broker_url', default=None)
        Configuration.result_backend = Configuration._readConfigEntry(key_shared, 'celery_result_backend', default=None)
        Configuration.test_mode = Configuration._readConfigEntry(key_shared, 'test_mode', default=False)

        # API section
        key_api = 'API'
        Configuration.api_port = Configuration._readConfigEntry(key_api, 'port', default=None)

        # Backend section
        key_backend = 'Backend'
        Configuration.database_uri = Configuration._readConfigEntry(key_backend, 'database_uri', default=None)
        Configuration.concurrency_min = Configuration._readConfigEntry(key_backend, 'concurrency_min', default=1)
        Configuration.concurrency_max = Configuration._readConfigEntry(key_backend, 'concurrency_max', default=1)

        # Frontend section
        key_frontend = 'Frontend'
        Configuration.frontend_url = Configuration._readConfigEntry(key_frontend, 'url', default='localhost:14201')

        # Payment section
        key_payment = 'Payment'
        Configuration.payment_mode = Configuration._readConfigEntry(key_payment, 'method', PaymentMethod.NONE)
        Configuration.payment_payout_threshold = Configuration._readConfigEntry(key_payment, 'payout_threshold', default=0.001)
        Configuration.payment_bitcoin_rpc_host = Configuration._readConfigEntry(key_payment, 'bitcoin_rpc_host', default='localhost')
        Configuration.payment_bitcoin_rpc_port = Configuration._readConfigEntry(key_payment, 'bitcoin_rpc_port', default='18443')
        Configuration.payment_bitcoin_rpc_user = Configuration._readConfigEntry(key_payment, 'bitcoin_rpc_user', default='admin1')
        Configuration.payment_bitcoin_rpc_password = Configuration._readConfigEntry(key_payment, 'bitcoin_rpc_password', default='123')
        Configuration.payment_bitcoin_rpc_timeout = Configuration._readConfigEntry(key_payment, 'bitcoin_rpc_timeout', default=2000)

        if Configuration.test_mode:
            Configuration.enable_test_mode()

        Configuration.initialized = True

    @staticmethod
    def enable_test_mode():
        """ For test purposes, use alternate configuration not to interfere with "production" data. """
        Configuration.test_mode = True
        key_backend_test = 'BackendTest'
        Configuration.database_uri = Configuration._readConfigEntry(key_backend_test, 'database_uri', default='sqlite:///test.db')
        Configuration.concurrency_min = Configuration._readConfigEntry(key_backend_test, 'concurrency_min', default=1)
        Configuration.concurrency_max = Configuration._readConfigEntry(key_backend_test, 'concurrency_max', default=1)

    @staticmethod
    def print_config():
        """ Textual representation of configuration. """
        if not Configuration.initialized:
            print('WARN: Configuration object is not yet initialized.')
            return

        print('Options set:')
        print('    broker_url = {}'.format(Configuration.broker_url))
        print('    result_backend = {}'.format(Configuration.result_backend))
        print('    database_uri = {}'.format(Configuration.database_uri))
        print('    api_port = {}'.format(Configuration.api_port))
        print('    autoscaling = [{}, {}]'.format(Configuration.concurrency_max, Configuration.concurrency_min))
