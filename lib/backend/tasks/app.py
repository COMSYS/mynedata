""" This module starts the backend process. """

import celery
from celery import bootsteps

from lib.config import Configuration
from lib.backend.database import DatabaseConnector

from lib.data_structures.enums import PaymentMethod
from lib.backend.payments import BitcoinConnector


class CustomArgs(bootsteps.StartStopStep):
    """ Pass custom arguments. """

    def __init__(self, worker, test_mode, **options):
        Configuration.initialize()
        if test_mode:
            Configuration.enable_test_mode()
        Configuration.print_config()
        worker.app.config_from_object(Configuration)
        DatabaseConnector.initialize(target=Configuration.database_uri)

        # Initialize payments
        if Configuration.payment_mode in [PaymentMethod.BITCOIN_DIRECT, PaymentMethod.BITCOIN_QUERY_BASED, PaymentMethod.BITCOIN_CENTRAL]:
            BitcoinConnector.initialize()


app = celery.Celery('data')

""" Custom Start Parameters """
# Documentation (i.e., source code) here: http://docs.celeryproject.org/en/latest/_modules/optparse.html
# Gives hints at how to use `celery.bin.Option`.

app.user_options['worker'].add(
    celery.bin.Option('--testmode', dest='test_mode', action='store_true', default=False, help='Enable test mode?')
)

app.steps['worker'].add(CustomArgs)

app.autodiscover_tasks([
    'lib.backend.tasks.data_source',
    'lib.backend.tasks.user',
    'lib.backend.tasks.query',
    'lib.backend.tasks.preprocessing',
    'lib.backend.tasks.payment',
])

# schedule for checking if queries are ready for further processing as well as if payments need to be conducted
app.conf.beat_schedule = {
    'add-every-30-seconds': {
        'task': 'lib.backend.tasks.query.tasks.process_queries',
        'schedule': 5.0,
    },
    'pay_out': {
        'task': 'lib.backend.tasks.payment.tasks.pay_out',
        'schedule': 60.0,
    },
}
