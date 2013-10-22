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
    },
    "function composition": function() {
        var adder3 = Util.compose( Util.inc, Util.inc, Util.inc );
        buster.assert.equals( adder3(0), 3 );
        buster.assert.equals( adder3(9), 12 );
    },
    "multiset equality": function() {
        buster.assert( Util.multisetsEqual(
            [1,2,3],
            [3,2,1],
            Util.jsonEqual
        ) );
        buster.refute( Util.multisetsEqual(
            [],
            [1],
            Util.jsonEqual
        ) );
        buster.refute( Util.multisetsEqual(
            [1],
            [],
            Util.jsonEqual
        ) );
    },
    "basic zip": function() {
	var alpha = [ "hello", "world" ],
            beta = [ "mjau", "mjau" ],
            gamma = [ "1", "2", "3" ],
            rv = Util.zip( function( a, b, c ) {
	       return a + b + c;
            }, alpha, beta, gamma );

	buster.assert.equals( rv, ["hellomjau1",
				   "worldmjau2"] );
    },
    "basic zip_": function() {
	var alpha = [ "hello", "world" ],
            beta = [ "mjau", "mjau" ],
            gamma = [ "1", "2", "3" ],
            coll = [],
            rv = Util.zip_( function( a, b, c ) {
		coll.push( a + b + c );
            }, alpha, beta, gamma );

	buster.assert.equals( rv, null );
	buster.assert.equals( coll, ["hellomjau1", "worldmjau2"] );
    },
    "high-arity function composition": function() {
        var f = Util.compose( function(a,b) { return a + b; },
                              Util.inc,
                              Util.inc );
        buster.assert.equals( f(3,5), 10 );
        buster.assert.equals( f(1,3), 6 );
        buster.assert.equals( f(9,9), 20 );
    },
    "name array test": function() {
        var rv = Util.nameArray( ["x", "y", "z"],
                                 [42, 43, 44] );
        buster.assert.equals( rv.x, 42 );
        buster.assert.equals( rv.y, 43 );
        buster.assert.equals( rv.z, 44 );
    }
} );
