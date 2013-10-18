.PHONY: all clean test android

all: bundle

BUNDLE_NAME=generated/flippers_bundle.js
ANDROID_TARGET=android/Flippers/assets/
EXTRA_ASSETS=flippers.html modernizr.custom.29265.js kibo.js jquery-2.0.3.js normalize.css

JSLINT_OPTIONS=--white --plusplus --unparam --continue

clean:
	rm -f $(BUNDLE_NAME)

test:
	buster-test

lint:
	jslint $(JSLINT_OPTIONS) src/*.js

bundle: $(BUNDLE_NAME)

root: bundle
	cp $(BUNDLE_NAME) .

android: bundle
	cp $(EXTRA_ASSETS) $(ANDROID_TARGET)
	cp $(BUNDLE_NAME) $(ANDROID_TARGET)

$(BUNDLE_NAME): src/*.js
	mkdir -p generated/
	browserify --debug src/bootstrap.js > $@


