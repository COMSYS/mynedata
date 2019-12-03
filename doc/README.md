# Build Documentation

A compiled version of the documentation is already part of the repository.
If you want to rebuild the documentation nevertheless, e.g., because of local changes, you can run the required commands from within the Vagrant virtual machine to avoid further dependencies on your host machine.

If you want to run it in your own environment, as sphinx runs the python code, the same requirements as for just running the code are needed, which can be found in the `vagrant/setup_mynedata.sh`.  
To generate swaggerdocs, just java is needed.

## Building the documentation

* Build all documentation: `make all`
* Build code documentation (Sphinx): `make code`
* Build API documentation (Swagger): `make api`
* To delete the generated files: `make clean`
