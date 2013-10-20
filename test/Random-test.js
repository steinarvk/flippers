var buster = require("buster");

var Random = require("../src/Random");

var Util = require("../src/Util");

buster.testCase( "Random", {
    "choice": function() {
        var xs = ["foo", "bar", "baaz"], i, x;
        for(i = 0; i < 100; i++) {
            x = Random.choice( xs );
            buster.refute.equals( xs.indexOf(x), -1 );
        }
    },
    "choices": function() {
        var xs = ["foo", "bar", "baaz"], i, x;
        for(i = 0; i < 100; i++) {
            x = Random.choices( [xs,xs,xs] );
            buster.assert.equals( x.length, 3 );
            buster.refute.equals( xs.indexOf(x[0]), -1 );
            buster.refute.equals( xs.indexOf(x[1]), -1 );
            buster.refute.equals( xs.indexOf(x[2]), -1 );
        }
    },
    "digits": function() {
        var i, d, xs = [];
        for(i = 0; i < 100; i++) {
            d = Random.digits(6);
            buster.assert.isString( d );
            buster.assert.equals( d.length, 6 );
            buster.refute.equals( parseInt( d, 10 ), 0 );
            xs.push( d );
        }
        buster.assert.greater( Util.uniqueElements( xs ).length, 0.95 * xs.length  );
    },
    "letters": function() {
        var i, d, xs = [];
        for(i = 0; i < 100; i++) {
            d = Random.letters(32);
            buster.assert.isString( d );
            buster.assert.equals( d.length, 32 );
            xs.push( d );
        }
        buster.assert.equals( Util.uniqueElements( xs ).length, xs.length );
    }
} );
