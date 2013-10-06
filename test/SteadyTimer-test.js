var buster = require("buster");

var SteadyTimer = require( "../src/SteadyTimer" );

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
