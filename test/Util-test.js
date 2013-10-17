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
        buster.assert.equals( Util.uniqueElements( [5,1,2,3,4,7,2,3,4,5,6] ),
                              [5,1,2,3,4,7,6] );
    },
    "merge": function() {
        var x = {"foo": 42, "bar": "baz"};
        var y = {"foo": 90, "baa": "baa"};
        var z = {50: 99, "foo": "hah"};
        
        buster.assert.equals( Util.merge(x,y,z),
                              {"foo": "hah",
                               "bar": "baz",
                               50: 99,
                               "baa": "baa"} );

        buster.assert.equals( Util.merge(z,y,x),
                              {"foo": 42,
                               "bar": "baz",
                               50: 99,
                               "baa": "baa"} );
    }
} );
