MOCHA=node_modules/.bin/mocha
LINT=node_modules/jshint/bin/jshint

test: lint; \
    $(MOCHA)

lint: \
    $(LINT) index.js \
    $(LINT) test/*.js

