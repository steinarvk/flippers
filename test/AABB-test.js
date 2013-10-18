var buster = require("buster");

var AABB = require( "../src/AABB" );

buster.testCase( "AABB", {
    "basic": function() {
        var x = AABB.create( {x: 10, y: 20, width: 30, height: 40 } );
        buster.assert( x.contains( {x: 10, y: 20} ) );
        buster.assert( x.contains( {x: 39, y: 20} ) );
        buster.assert( x.contains( {x: 10, y: 59} ) );
        buster.assert( x.contains( {x: 39, y: 59} ) );
        buster.refute( x.contains( {x: 9, y: 20} ) );
        buster.refute( x.contains( {x: 40, y: 20} ) );
        buster.refute( x.contains( {x: 10, y: 60} ) );
        buster.refute( x.contains( {x: 39, y: 19} ) );
    }
    
} );
