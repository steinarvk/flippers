var buster = require("buster");

var Flippers = require( "../flippers" );

var LayoutShare = Flippers.LayoutShare;
var SteadyTimer = Flippers.SteadyTimer;

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

buster.testCase( "SteadyTimer", {
    "simple manual": function() {
        var counter = 0;
        var x = SteadyTimer.create( 13, function() {
            counter++;
        }, {manual: true} );

        buster.assert( !x.running() );
        x.start();
        buster.assert( x.running() );

        buster.assert.equals( counter, 0 );

        x.addTime( 12 );

        buster.assert.equals( counter, 0 );

        x.addTime( 1 );

        buster.assert.equals( counter, 1 );

        x.addTime( 26 );

        buster.assert.equals( counter, 3 );
    }
} );
