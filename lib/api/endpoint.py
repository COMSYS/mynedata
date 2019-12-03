""" This script launches the API process. """

import sys
import os
import logging

import connexion
import celery
from flask_cors import CORS

lib_folder = '/'.join(os.path.split(os.path.dirname(sys.path[0]))[:-1])
sys.path.insert(0, lib_folder)

from lib.config import Configuration

# from .model_encoder import ModelEncoder

# Don't get confused: This does not start celery. It only creates an object that helps us to put tasks into the queue.
# The actual celery job that will execute the tasks is started on the bash/cmd with the command
# `celery -A tasks worker --loglevel=info`


def make_celery(flaskapp, test_mode=False):
    """ Launch Celery. """
    cel = celery.Celery(flaskapp.import_name)
    cel.conf.update(flaskapp.config)
    if test_mode:
        Configuration.enable_test_mode()
    cel.config_from_object(Configuration)
    taskbase = cel.Task

    class ContextTask(taskbase):
        """ Create a flask context task. """
        abstract = True

        def __call__(self, *args, **kwargs):
            with flaskapp.app_context():
                return taskbase.__call__(self, *args, **kwargs)

    cel.Task = ContextTask
    return cel


Configuration.initialize()
logging.basicConfig(level=logging.DEBUG)
app = connexion.App(__name__)
app.add_api('api.yaml')
CORS(app.app, origins=[Configuration.frontend_url])
app.app.config.update(
    celery_broker_url=Configuration.broker_url,
    celery_result_backend=Configuration.result_backend,
)
make_celery(app.app, test_mode=Configuration.test_mode)
application = app.app
