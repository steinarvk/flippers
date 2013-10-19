.PHONY: all clean test android

all: bundle

BUNDLE_NAME=generated/flippers_bundle.js
ANDROID_TARGET=android/Flippers/assets/
EXTRA_ASSETS=flippers.html modernizr.custom.29265.js kibo.js jquery-2.0.3.js normalize.css assets/*.png

JSLINT_OPTIONS=--color --white --plusplus --unparam --continue

clean:
	rm -f $(BUNDLE_NAME)

test:
	buster-test

test-coverage:
	istanbul cover buster-test

tabcheck:
	for i in src/*.js; do echo $$i `xxd $$i | sed -r "s/^[0-9a-f]+://" | grep -E "( 09|09 )" | wc -l` ; done | grep -v " 0$$"

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


