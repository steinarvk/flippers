var buster = require("buster");

var Util = require("../src/Util");

buster.testCase( "Util", {
    "endsWith": function() {
        buster.assert( Util.endsWith( "forthwith", "with" ) );
        buster.refute( Util.endsWith( "forthwith", "wit" ) );
        buster.assert( Util.endsWith( "notwithstanding", "standing" ) );
        buster.assert( Util.endsWith( "anyway", "" ) );
        buster.assert( Util.endsWith( "nevertheless", "nevertheless" ) );
    },
    "uniqueElements": function() {
        var x = 
        buster.assert.equals( Util.uniqueElements( [5,1,2,3,4,7,2,3,4,5,6] ),
                              [5,1,2,3,4,7,6] );
    }
} );
