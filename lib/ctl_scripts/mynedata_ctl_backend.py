#!/usr/bin/env python3

""" This script starts the myneData backend. """

import sys
import os
import subprocess
import psutil
import argparse

lib_folder = '/'.join(os.path.split(os.path.dirname(sys.path[0]))[:-1])
sys.path.insert(0, lib_folder)

from lib.config import Configuration

PID_FILE = '/opt/mynedata/backend_pid'


class MynedataBackendCtl():

    backend_process = None

    @staticmethod
    def main(testmode=False, workdir=lib_folder):
        if MynedataBackendCtl.backend_process is not None:
            return
        if not Configuration.initialized:
            Configuration.initialize()

        mynedata_backend_command = 'celery worker {tasks} {workdir} {celerybeat} {testmode} {logfile} {loglevel} {autoscale}'.format(
            tasks='-A lib.backend.tasks.app -B',
            workdir='--workdir {}'.format(workdir),
            celerybeat='--schedule=/tmp/celerybeat-schedule',
            testmode='--testmode' if testmode else '',
            logfile='--logfile=/opt/mynedata/log/backend.log',
            loglevel='--loglevel=debug',
            autoscale='--autoscale %s,%s' % (Configuration.concurrency_max, Configuration.concurrency_min),
        )

        if testmode:
            Configuration.enable_test_mode()
        Configuration.print_config()

        MynedataBackendCtl.backend_process = subprocess.Popen(mynedata_backend_command, shell=True)
        with open(PID_FILE, 'w') as f_pid:
            f_pid.write(str(MynedataBackendCtl.backend_process.pid) + '\n')

    @staticmethod
    def shutdown(testmode=False, workdir=lib_folder):
        try:
            with open(PID_FILE, 'r') as f_pid:
                pid = int(f_pid.readlines()[0])
            process = psutil.Process(pid)
            for proc in process.children(recursive=True):
                proc.kill()
            process.kill()
        except Exception:
            return


if __name__ == '__main__':
    argparser = argparse.ArgumentParser()
    argparser.add_argument('--testmode', action='store_true', default=False, help='Enable test mode (fresh SQLite database in backend)')
    argparser.add_argument('--shutdown', action='store_true', default=False, help='Destroy backend celery process.')
    arguments = argparser.parse_args()
    if arguments.shutdown:
        MynedataBackendCtl.shutdown(testmode=arguments.testmode, workdir=lib_folder)
    else:
        MynedataBackendCtl.main(testmode=arguments.testmode, workdir=lib_folder)
