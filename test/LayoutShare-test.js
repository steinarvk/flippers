var buster = require("buster");

var LayoutShare = require("../src/LayoutShare" );

buster.testCase( "LayoutShare", {
    "simple proportional": function() {
        var xs = LayoutShare.allot( 100, [{}, {}, {}, {}] );
        buster.assert( xs.length == 4 );
        buster.assert( xs.every( function(x) { return x == 25; } ) );
    },
    "simple mixed": function() {
        var xs = LayoutShare.allot( 100,
                                             [{fixed: 50},
                                              {share: 2},
                                              {share: 3}] );
        buster.assert.equals( xs, [50, 20, 30] );
    },
    "minimum active": function() {
        var xs = LayoutShare.allot( 100,
                                             [{min: 60,
                                               share: 2},
                                              {share: 3}] );
        buster.assert.equals( xs, [60, 40] );
    },
    "minimum not active": function() {
        var xs = LayoutShare.allot( 100,
                                             [{min: 30,
                                               share: 2},
                                              {share: 3}] );
        buster.assert.equals( xs, [40, 60] );
    },
    "minima exceed constraints": function() {
        var xs = LayoutShare.allot( 100,
                                             [{min: 30},
                                              {fixed: 40},
                                              {min: 50},
                                              {fixed: 60}] );
        buster.assert.equals( xs, [30, 40, 50, 60] );
    },
} );

