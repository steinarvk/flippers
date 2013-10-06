var buster = require("buster");

var GameState = require("../src/GameState");

var PredefinedLevels = require("../src/PredefinedLevels" );

buster.testCase( "GameState", {
    "no mutation of loaded level (old level format)": function() {
        var data = {"rows":7,"cols":7,"contents":[{"type":"flipper","col":6,"row":5,"ascending":true},{"type":"flipper","col":6,"row":1,"ascending":false},{"type":"flipper","col":4,"row":1,"ascending":true},{"type":"flipper","col":4,"row":3,"ascending":true},{"type":"flipper","col":3,"row":3,"ascending":true},{"type":"flipper","col":2,"row":3,"ascending":false},{"type":"flipper","col":2,"row":1,"ascending":false},{"type":"flipper","col":0,"row":1,"ascending":true}]};

        var data_before = JSON.stringify( data );
        
        var state = GameState.loadOld( data );

        var saved_before = state.save();

        var changed = 0;

        for(var i = 0; i < 7; i++) {
            for(var j = 0; j < 7; j++) {
                var element = state.elementAtCell( {col: i, row: j} );
                if( element && element.ascending !== undefined ) {
                    changed++;
                    element.ascending = !element.ascending;
                }
            }
        }

        var saved_after = state.save();

        buster.assert.greater( changed, 0 );
        buster.assert.equals( data_before, JSON.stringify( data ) );
        buster.refute.equals( saved_before, saved_after );
    },
    "no mutation of loaded level (new level format)": function() {
        var data = {"size":{"cols":7,"rows":7},"origin":{"col":3,"row":7},"initialVelocity":{"dx":0,"dy":-1},"target":{"col":3,"row":7},"elements":[{"col":3,"row":6,"type":"breakable-triangle","rotation":1},{"col":6,"row":6,"type":"breakable-triangle","rotation":3},{"col":6,"row":3,"type":"breakable-triangle","rotation":0},{"col":1,"row":3,"type":"breakable-triangle","rotation":1},{"col":0,"row":1,"type":"breakable-triangle","rotation":1},{"col":4,"row":1,"type":"breakable-triangle","rotation":0},{"col":4,"row":4,"type":"breakable-square"},{"col":3,"row":5,"type":"breakable-triangle","rotation":3},{"col":3,"row":0,"type":"breakable-triangle","rotation":1},{"col":1,"row":0,"type":"breakable-triangle","rotation":1},{"col":0,"row":4,"type":"breakable-triangle","rotation":2},{"col":0,"row":5,"type":"breakable-triangle","rotation":1},{"col":1,"row":6,"type":"breakable-triangle","rotation":3},{"col":0,"row":6,"type":"breakable-triangle","rotation":2},{"col":5,"row":2,"type":"breakable-triangle","rotation":3},{"col":1,"row":1,"type":"breakable-triangle","rotation":1},{"col":4,"row":0,"type":"breakable-triangle","rotation":0},{"col":5,"row":1,"type":"breakable-triangle","rotation":0},{"col":2,"row":2,"type":"breakable-square"},{"col":6,"row":2,"type":"breakable-triangle","rotation":3},{"col":6,"row":0,"type":"breakable-triangle","rotation":0}]};

        var data_before = JSON.stringify( data );
        
        var state = GameState.load( data );

        var saved_before = state.save();

        var changed = 0;

        for(var i = 0; i < 7; i++) {
            for(var j = 0; j < 7; j++) {
                var element = state.elementAtCell( {col: i, row: j} );
                if( element && element.rotation !== undefined ) {
                    changed++;
                    element.rotation = (element.rotation + 1) % 4;
                }
            }
        }

        var saved_after = state.save();

        buster.assert.greater( changed, 0 );
        buster.assert.equals( data_before, JSON.stringify( data ) );
        buster.refute.equals( saved_before, saved_after );
    },

} );
