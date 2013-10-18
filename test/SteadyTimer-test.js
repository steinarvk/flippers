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
    },
    "simple automatic": function( done ) {
        var counter = 0;
        var x = SteadyTimer.create( 13, function() {
            counter++;

            if( counter >= 10 ) {
                buster.assert( true );
                done();
            }
        }, {manual: false} );
        x.start();
    },
    "stop automatic": function( done ) {
        var counter = 0;
        var x = SteadyTimer.create( 13, function() {
            counter++;

            if( counter >= 5 ) {
                buster.assert( false );
                done();
            }
        }, {manual: false} );
        x.start();
        setTimeout( function() {
            x.stop();
        }, 50 );
        setTimeout( function() {
            buster.assert.less( counter, 5 );
            done();
        }, 100 );
    }
} );
