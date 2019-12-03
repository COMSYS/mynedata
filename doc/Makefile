SPHINXOPTS=
SPHINXBUILD=sphinx-build
SPHINXPROJ=platform
SOURCEDIR=source
BUILDDIR=build
DEVDIR=../dev
CODEDIR=../lib
SWAGGERFILE=../lib/api/api.yaml
APIOUTDIR=api

all: code api
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)
code:
	sphinx-apidoc --force -o $(SOURCEDIR)/ $(CODEDIR)
	make html
api:
ifeq ("$(wildcard $(DEVDIR)/swagger-codegen-cli.jar)","")
	wget http://central.maven.org/maven2/io/swagger/swagger-codegen-cli/2.3.1/swagger-codegen-cli-2.3.1.jar -O $(DEVDIR)/swagger-codegen-cli.jar
endif
	java -jar $(DEVDIR)/swagger-codegen-cli.jar generate -l html -i $(SWAGGERFILE) -o $(APIOUTDIR)/
clean:
	find $(SOURCEDIR)/ -type f ! -name "index.rst" ! -name "conf.py" -exec rm {} \;
	rm -rf $(BUILDDIR)
	rm -rf $(APIOUTDIR)

.PHONY: help Makefile api all code

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)
