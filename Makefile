.PHONY: all clean test

all: flippers_bundle.js

BUNDLE_NAME=flippers_bundle.js

clean:
	rm -f $(BUNDLE_NAME)

test:
	buster-test

$(BUNDLE_NAME): flippers.js bootstrap.js
	browserify --debug bootstrap.js > $@


