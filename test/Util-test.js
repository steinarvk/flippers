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
    },
    "arrayRemoveElements": function() {
        var x = [1,9,1,5,8,7,9];
        Util.arrayRemoveElement( x, 9 );
        buster.assert.equals( x, [1,1,5,8,7,9] );
        Util.arrayRemoveElement( x, 1 );
        buster.assert.equals( x, [1,5,8,7,9] );
        Util.arrayRemoveElement( x, 9 );
        buster.assert.equals( x, [1,5,8,7] );
        Util.arrayRemoveElement( x, 11 );
        buster.assert.equals( x, [1,5,8,7] );
    },
    "rectRadius": function() {
        var rect1 = {x: 10, y: 30, width: 100, height: 120},
            rect2 = {x: 10, y: 30, width: 150, height: 50};
        buster.assert.equals( Util.rectInnerRadius( rect1 ), 50 );
        buster.assert.equals( Util.rectInnerRadius( rect2 ), 25 );
    },
    "rectCenter": function() {
        var rect1 = {x: 10, y: 30, width: 100, height: 120},
            rect2 = {x: 10, y: 30, width: 150, height: 50};
        buster.assert.equals( Util.rectCenter( rect1 ).x, 60 );
        buster.assert.equals( Util.rectCenter( rect1 ).y, 90 );
        buster.assert.equals( Util.rectCenter( rect2 ).x, 85 );
        buster.assert.equals( Util.rectCenter( rect2 ).y, 55 );
    }
} );
