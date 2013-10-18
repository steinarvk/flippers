var buster = require("buster");

var Random = require("../src/Random");

buster.testCase( "Random", {
    "choice": function() {
        var xs = ["foo", "bar", "baaz"], i, x;
        for(i = 0; i < 100; i++) {
            x = Random.choice( xs );
            buster.refute.equals( xs.indexOf(x), -1 );
        }
    }
} );
