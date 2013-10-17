var buster = require("buster");

var Generator = require("../src/Generator");
var Util = require("../src/Util");

buster.testCase( "Generator", {
    "integers": function() {
        var g = Generator.integers();
        for(var i = 0; i < 100; i++) {
            buster.assert( g() == i );
        }
    },
    "map": function() {
        var g = Generator.map( Generator.integers(), function(x) {
            return 2 * x + 1;
        } );
        for(var i = 0; i < 100; i++) {
            buster.assert( g() == (2*i + 1) );
        }
    },
    "filter even": function() {
        var g = Generator.filter( Generator.integers(), function(x) {
            return (x%2) == 0;
        } );
        for(var i = 0; i < 100; i++) {
            buster.assert( g() == (2*i) );
        }
    },
    "filter odd": function() {
        var g = Generator.filter( Generator.integers(), function(x) {
            return (x%2) != 0;
        } );
        for(var i = 0; i < 100; i++) {
            buster.assert( g() == (2*i + 1) );
        }
    },
    "finite from array": function() {
        var g = Generator.fromArray( [9,5,8,10] );
        buster.assert( g() == 9 );
        buster.assert( g() == 5 );
        buster.assert( g() == 8 );
        buster.assert( g() == 10 );
        buster.assert( g() === undefined );
        buster.assert( g() === undefined );
        buster.assert( g() === undefined );
    },
    "take": function() {
        var g = Generator.integers();
        buster.assert.equals( Generator.take( 10, g ),
                              [0,1,2,3,4,5,6,7,8,9] );
    },
    "take from finite": function() {
        var g = Generator.fromArray( [1,2,3,4,5] );
        buster.assert.equals( Generator.take( 3, g ),
                              [1,2,3] );
        g = Generator.fromArray( [1,2,3,4,5] );
        buster.assert.equals( Generator.take( 5, g ),
                              [1,2,3,4,5] );
        g = Generator.fromArray( [1,2,3,4,5] );
        buster.assert.equals( Generator.take( 10, g ),
                              [1,2,3,4,5] );
    },
    "take again": function() {
        var g = Generator.integers();
        buster.assert.equals( Generator.take(3, g), [0,1,2] );
        buster.assert.equals( Generator.take(5, g), [3,4,5,6,7] );
        buster.assert.equals( Generator.take(2, g), [8,9] );
    },
    "concatenate": function() {
        buster.assert.equals(
            Generator.toArray(
                Generator.concat(
                    Generator.fromArray( [1,2,3] ),
                    Generator.fromArray( [4,5] ),
                    Generator.fromArray( [3,2] ) ) ),
            [1,2,3,4,5,3,2] );
    },
    "cartesian product": function() {
        var a = [1,2,3,4];
        var b = [5,6,7];
        var c = [8,9];
        var result = Generator.toArray( Generator.product( a, b, c ) );
        buster.assert.equals( result.length, 24 );
        for(var i = 0; i < result.length; i++) {
            buster.assert( a.indexOf( result[i][0] ) != -1 );
            buster.assert( b.indexOf( result[i][1] ) != -1 );
            buster.assert( c.indexOf( result[i][2] ) != -1 );
        }
        buster.assert.equals( Util.uniqueElements( result ).length, 24 );
    }
} );
