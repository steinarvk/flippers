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

$(BUNDLE_NAME): src/bootstrap.js src/AABB.js src/DiagramGraphics.js src/GameState.js src/Inventory.js src/LayoutShare.js src/Main.js src/Map2D.js src/Mouse.js src/PredefinedLevels.js src/RegionGrid.js src/Regions.js src/SmoothGameState.js src/SteadyTimer.js src/Util.js src/Solver.js src/Screen.js src/Picture.js src/Sound.js
	mkdir -p generated/
	browserify --debug src/bootstrap.js > $@


