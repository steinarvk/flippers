var buster = require("buster");

var GameState = require("../src/GameState");
var Util = require("../src/Util");

var PredefinedLevels = require("../src/PredefinedLevels" );

function calculateExit( state, limit ) {
    limit = limit || 1000;
    var game = GameState.load( state );

    game.start();
    
    for(var i = 0; i < limit; i++) {
        if( game.status() != "running" ) {
            return game.ball();
        }
        game.advance();
    }

    return null;
}

buster.testCase( "Scenarios", {
    "empty": function() {
        var ball = calculateExit( {size: {cols: 3, rows: 3},
                                   origin: {col: 1, row: 3},
                                   initialVelocity: {dx: 0, dy: -1},
                                   target: {col: 1, row: -1},
                                   elements: []
                                   } );
        buster.assert.equals( ball.position, {col: 1, row: -1} );
    },
    "basic ascending flip": function() {
        var ball = calculateExit( {size: {cols: 3, rows: 3},
                                   origin: {col: 1, row: 3},
                                   initialVelocity: {dx: 0, dy: -1},
                                   target: {col: 1, row: -1},
                                   elements: [{type: "flipper",
                                               col: 1,
                                               row: 1,
                                               ascending: true}]
                                   } );
        buster.assert.equals( ball.position, {col: 3, row: 1} );
    },
    "basic descending flip": function() {
        var ball = calculateExit( {size: {cols: 3, rows: 3},
                                   origin: {col: 1, row: 3},
                                   initialVelocity: {dx: 0, dy: -1},
                                   target: {col: 1, row: -1},
                                   elements: [{type: "flipper",
                                               col: 1,
                                               row: 1,
                                               ascending: false}]
                                   } );
        buster.assert.equals( ball.position, {col: -1, row: 1} );
    },
    "basic head-on bounce": function() {
        var ball = calculateExit( {size: {cols: 3, rows: 3},
                                   origin: {col: 1, row: 3},
                                   initialVelocity: {dx: 0, dy: -1},
                                   target: {col: 1, row: -1},
                                   elements: [{type: "square",
                                               col: 1,
                                               row: 1}]
                                   } );
        buster.assert.equals( ball.position, {col: 1, row: 3} );
    },
    "flip and head-on-bounce": function() {
        var ball = calculateExit( {size: {cols: 3, rows: 3},
                                   origin: {col: 1, row: 3},
                                   initialVelocity: {dx: 0, dy: -1},
                                   target: {col: 1, row: -1},
                                   elements: [{type: "flipper",
                                               col: 1,
                                               row: 1,
                                               ascending: false},
                                             {type: "square",
                                              col: 0,
                                              row: 1}]
                                   } );
        buster.assert.equals( ball.position, {col: 1, row: -1} );
    },
    "problematic switch situation": function() {
        var ball = calculateExit( {"size":{"cols":7,"rows":7},"origin":{"col":3,"row":7},"initialVelocity":{"dx":0,"dy":-1},"target":{"col":3,"row":7},"elements":[{"col":3,"row":3,"type":"switch","colour":"red"},{"col":3,"row":2,"type":"square","colour":"red","deactivated":true},{"col":3,"row":4,"type":"triangle","rotation":3,"colour":"red","deactivated":true}]} );

        buster.assert.equals( ball.position, {col: -1, row: 4} );
    },
    "switch situation sanity check": function() {
        var ball = calculateExit( {"size":{"cols":7,"rows":7},"origin":{"col":3,"row":7},"initialVelocity":{"dx":0,"dy":-1},"target":{"col":3,"row":7},"elements":[{"col":3,"row":2,"type":"square","colour":"red","deactivated":true},{"col":3,"row":4,"type":"triangle","rotation":0,"colour":"red","deactivated":true},{"col":3,"row":6,"type":"switch","colour":"red"}]} );

        buster.assert.equals( ball.position, {col: -1, row: 4} );
    },
    "deactivated elements": function() {
        var ball = calculateExit( {"size":{"cols":7,"rows":7},"origin":{"col":3,"row":7},"initialVelocity":{"dx":0,"dy":-1},"target":{"col":3,"row":7},"elements":[{"col":3,"row":2,"type":"square","colour":"red","deactivated":true},{"col":3,"row":4,"type":"triangle","rotation":0,"colour":"red","deactivated":true}]} );

        buster.assert.equals( ball.position, {col: 3, row: -1} );
    }
} );


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
    "save canonicalization": function() {
        var sz = {cols: 3, rows: 3},
            st1 = GameState.create( sz ),
            st2 = GameState.create( sz ),
            cells = [],
            mkEl = function(cell) {
                return Util.merge( cell,
                                   {type: "flipper",
                                    ascending: cell.col === cell.row} );
            };
        st1.onAllCells( Util.compose( Util.jsonCopy,
                                      Util.collector(cells) ) );

        cells.forEach( function(cell) {
            st1.setElement( mkEl( cell ) );
        } );

        cells.reverse();

        cells.forEach( function(cell) {
            st2.setElement( mkEl( cell ) );
        } );

        buster.assert.equals( JSON.stringify( st1.save() ),
                              JSON.stringify( st2.save() ) );
    }
} );
