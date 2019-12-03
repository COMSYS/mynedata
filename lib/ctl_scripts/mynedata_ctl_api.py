#!/usr/bin/env python3

""" This script starts the myneData API. """

import sys
import os
from gevent import monkey

lib_folder = '/'.join(os.path.split(os.path.dirname(sys.path[0]))[:-1])
sys.path.insert(0, lib_folder)

from lib.config import Configuration
from lib.api import endpoint
monkey.patch_all()


if __name__ == '__main__':
    Configuration.initialize()
    Configuration.print_config()

    endpoint.app.debug = True
    endpoint.app.run(port=int(Configuration.api_port), server='gevent')
