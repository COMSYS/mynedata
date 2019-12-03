# myneData Prototype Implementation

This document describes how to set up the myneData demonstrator, which will be hosted locally in a Vagrant virtual machine, and how to set up the myneData prototype natively on a fresh Ubuntu machine.
Furthermore, we provide general technical information how to interact with the Vagrant VM in case of errors, but this mostly concerns developers.

## Run Demonstrator (via Vagrant)

### Set Up Vagrant

1. [Download VirtualBox](https://www.virtualbox.org/wiki/Downloads)
    * If you already installed VirtualBox, make sure that you perform an update!
2. [Download VirtualBox Extensions](https://www.virtualbox.org/wiki/Downloads) (click on the Extensions link and install the Extension pack)
    * to install the extension start VirtualBox as admin/root and go to `File -> Settings -> Extensions`
3. [Download Vagrant](https://www.vagrantup.com/downloads.html)

### Set Up myneData Demonstrator

To run the demonstrator, go inside the `vagrant` folder and run the `boot_demonstrator.sh` script:

```
cd vagrant
bash boot_demonstrator.sh
```

Vagrant will ask you to for a network device to use for Internet connectivity (to install needed software):

```
==> mynedata_platform: Available bridged network interfaces:
1) en1: Apple USB Ethernet Adapter
2) en0: Wi-Fi (AirPort)
3) p2p0
4) awdl0
5) en3: Thunderbolt 1
==> mynedata_platform: When choosing an interface, it is usually the one that is
==> mynedata_platform: being used to connect to the internet.
    mynedata_platform: Which interface should the network bridge to? 1
```

If you are working from an Apple device, you probably have similar network devices available as displayed above.
In this case, choose `Apple USB Ethernet Adapter` if you are currently connected to the Internet via an Ethernet cable or `Wi-Fi (AirPort)` if you are currently using Wifi.
For other systems, the available interfaces will differ (which makes this part hard to automate, sorry!).

The command will take a long time to install needed software inside the Vagrant machine and to build the UI, you can easily grab a coffee now.
Once it is finished, the myneData components will be started automatically inside the Vagrant machine.
From this point on, you can access the myneData UI via your browser at address `http://localhost:14201`.
The myneData API can be reached via `http://localhost:14201/api/v2`, respectively.

:information_source: Chrome is reported to display the frontend properly, Firefox has some issues.

### Demonstrator Technical Troubleshooting

:information_source: If the Application gets built and can be reached via `localhost:14201` but links do not work or the app behaves weirdly otherwise, you should run `sudo rm -rf /opt/mynedata/` from inside the vagrant VM. After that, exit the VM and run the `boot_demonstrator.sh` script anew.

:information_source: If the app doesn't even get built, log into vagrant via `vagrant ssh` and execute `sudo bash /mynedata/dev/setup_mynedata_environment.sh`.


## Native Setup

:information_source: We assume that you install everything on a **fresh** machine.
Our setup will potentially change system-wide configuration (but create backups of replaced config files - hopefully).

:information_source: The scripts are only written to work with Ubuntu-like systems.

Everything should be installed automatically when running:

```
sudo bash dev/setup_mynedata_environment.sh
```

Afterwards, you can start all services via:

```
bash mynedata_all.sh start
```

## Low-Level Usage of the Vagrant Virtual Machine

:information_source: Vagrant expects all commands to be run from the folder containing the `Vagrantfile`, hence use `cd vagrant` before proceeding.

#### Setup

1. Go to `vagrant` folder
2. Add Ubuntu 14.04 VM to Vagrant:
    ```vagrant box add ubuntu/trusty64```
3. Start VM:
    ```vagrant up```
    Your checkout of the code repository is automatically mounted to `/mynedata`.

#### Use VM

##### Start VM

Go to `vagrant` folder and execute:
```vagrant up```

* The repository's main folder is automatically mounted to `/mynedata`.
* Files created by myneData are stored at `/opt/mynedata`.

##### SSH Access

Go to `vagrant` folder, make sure that VM runs and then execute:
```vagrant ssh```

* Execute a single command with `vagrant ssh -c "${your_command}"`.

##### Various VM commands

* Stop Vagrant VM: `vagrant halt -f` (forces shutdown, graceful shutdown does not work for me and thus only unnecessarily prolongs the process)
* Delete Vagrant VM: `vagrant destroy -f`

## Getting Started

* Make sure that the RabbitMQ server is running (should be the case by default)
* run the test_all.sh script once to set up the bitdoind settings
* before running backend and API start the bitcoind. Simply copy the command from the test_all.sh script.
* Start the backend and the API (preferably in different shells):  
`python3 mynedata_api.py`  
`python3 mynedata_backend.py`  
* The API is now listening by default on port 14200, i.e., the API is reachable via `http://localhost:14200` (Can be changed in `config.ini`)
    * You can, for instance, test the API via `curl`:
      ```
      curl -H "Content-Type: application/json" -d '{"password": "123456", "firstname": "Max", "lastname": "Mustermann", "birthday": "11.11.2011", "street": "Musterstraße 1", "postal": "52000", "city": "Aachen"}' -X POST http://localhost:14200/user/max/register
	  curl -H "Content-Type: application/json" -d '{"pw": "123456"}' -X POST http://localhost:14200/user/max/login
      curl -H "Content-Type: application/json" -d '{"data_source_name": "newdatasource", "data_source_uuid": 1, "token": "6398"}' -X POST http://localhost:14200/user/max/data_source
      ```

An overview of all API endpoints can be generated, see *Development Tools*.
## run frontend/GUI/cockpit for showcasing (soon-to-be deprecated)
When showcasing, the frontend is accessible via `http://localhost:14201/`
### Frontend only (soon-to-be deprecated)
When logged in to the Vagrant VM via `vagrant ssh`, run `/mynedata/mynedata_frontend.sh`. If angular is not yet installed,
the script will call `/mynedata/dev/install_angular.sh` by itself. Simply kill the frontend by hitting ctrl + c.
### Frontend, Backend and API at once (soon-to-be deprecated)
#### In terminal (soon-to-be deprecated)
When logged in to the Vagrant VM via `vagrant ssh`, run `/mynedata/mynedata_all.sh`. If angular is not yet installed,
the script will call `/mynedata/dev/install_angular.sh` by itself. All API calls will be printed to the terminal. Simply kill the bundle by hitting ctrl + c.
#### In Background (soon-to-be deprecated)
When logged in to the Vagrant VM via `vagrant ssh`, run `/mynedata/mynedata_all.sh start`. If angular is not yet installed,
the script will call `/mynedata/dev/install_angular.sh` by itself. To kill the backgrounded tasks, simply
run `/mynedata/mynedata_all.sh stop`.
## run frontend/GUI/cockpit for development
Head over to [frontend/README.md](frontend/README.md)

## Development Tools

The folder `/dev` contains scripts related to more efficient or high-quality programming processes.
To make use of these development tools, make sure to execute `setup_devtools.sh` in the `dev` folder.
This repository features the following development tools, which have to be executed from the `dev` folder:

* `pre-commit` hook
    * As of now, we only use a `pre-commit` hook to enforce that committed Python code is `pep8`-compatible, with some well-defined relaxations.
      The accepted as well as proposed `pep8` relaxations are documented in [the wiki](https://laboratory.comsys.rwth-aachen.de/myneData/platform/wikis/code-conventions#accepted-pep8-relaxations).

## Documentation

To build the documentation, see [doc/README.md](doc/README.md)

### Query Language
The query Language is SQL like. e.g. `SELECT AVG(RandomData.random_two) WHERE (PersonalInformation.city = aachen) OR (PersonalInformation.city = bochum)`
Currently Only `AVG` : calculates the Avg over all users per timestamp
and `SUM`: calculates the sum over all users and all timestamps
are implemented. Each function gets `Datasource.attribute` as argument (or more depending on the function).
The constraints are implemented in Disjunctive NormalForm where the left side of each `OR` and each `AND` is a single constraint of the form 
`Datasource.attribute [<,>,=] String/Number` where `[<,>]` is only valid for numbers. 
So `... WHERE (A.a = b) OR ((B.b = b) OR (C.c = c))` is valid while `... WHERE ((A.a = b) OR (B.b = b)) OR (C.c = c))` is not.
