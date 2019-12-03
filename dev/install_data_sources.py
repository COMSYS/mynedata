#!/usr/bin/env python3

""" This script can be used to install available data sources. """

import json
import argparse
from os import listdir
from os.path import isfile, join

from .lib.config import Configuration
from .lib.backend.database import DatabaseConnector
from .lib.backend.tasks.data_source import tasks as data_source_tasks

# e.g.:
# $ python3
# >>> from install_data_sources import install
# >>> install("sqlite:///test.db")


if __name__ == '__main__':
    argparser = argparse.ArgumentParser()
    argparser.add_argument('database_path', type=str, default='sqlite:////opt/mynedata/backend.db')
    args = argparser.parse_args()
    database_path = args.database_path

    Configuration.initialize()
    DatabaseConnector.initialize(target=database_path)

    # Check for already registered data sources
    already_registered_data_sources = [s['data_source_name'] for s in json.loads(data_source_tasks.get_available_data_source_list())['response']]

    # add available data sources
    files = [f.replace(".py", "") for f in listdir("lib/data_sources/") if isfile(join("lib/data_sources/", f)) and f.endswith(".py") and "init" not in f]
    for i, f in enumerate(files):
        if f not in already_registered_data_sources:
            print('Registering data source "{}".'.format(f))
            data_source_tasks.add_available_data_source(f, i + 1)
        else:
            print('Skipping already registered data source "{}".'.format(f))
