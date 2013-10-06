.PHONY: all clean test

all: bundle

BUNDLE_NAME=generated/flippers_bundle.js

clean:
	rm -f $(BUNDLE_NAME)

test:
	buster-test

bundle: $(BUNDLE_NAME)

$(BUNDLE_NAME): src/bootstrap.js src/AABB.js src/DiagramGraphics.js src/GameState.js src/Inventory.js src/LayoutShare.js src/Main.js src/Map2D.js src/Mouse.js src/PredefinedLevels.js src/RegionGrid.js src/Regions.js src/SmoothGameState.js src/SteadyTimer.js src/Util.js
	browserify --debug src/bootstrap.js > $@


