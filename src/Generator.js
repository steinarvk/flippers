"use strict";

var Util = require("../src/Util");

var Generator = (function() {
    function integers(n) {
        n = n || 0;
        return function() {
            return n++;
        };
    }
    
    function fromArray( a ) {
        var index = 0;
        return function() {
            if( index >= a.length ) {
                return undefined;
            }
            return a[index++];
        };
    }

    function toArray( g ) {
        var rv = [],
            x;
        while( true ) {
            x = g();
            if( x === undefined ) {
                break;
            }
            rv.push( x );
        }
        return rv;
    }

    function genTake( n, g ) {
        var rv = [],
            x, i;
        for(i = 0; i < n; i++) {
            x = g();
            if( x === undefined ) {
                break;
            }
            rv.push( x );
        }
        return rv;
    }

    function genTakeGen( n, g ) {
        var count = 0;
        return function() {
            if( count >= n ) {
                return undefined;
            }
            ++count;
            return g();
        };
    }

    function genMap( g, f ) {
        return function() {
            var x = g();
            if( x === undefined ) {
                return undefined;
            }
            return f(x);
        };
    }

    function genFilter( g, f ) {
        return function() {
            var x;
            do {
                x = g();
            } while( x !== undefined && !f(x) );
            return x;
        };
    }

    function onVarargs( f ) {
        return function() {
            var arg = [],
                i;
            for(i = 0; i < arguments.length; i++) {
                arg.push( arguments[i] );
            }
            return f( arg );
        };
    }

    function genConcat( generators ) {
        return function() {
            var x;
            while( generators.length ) {
                x = generators[0]();
                if( x === undefined ) {
                    generators.shift();
                } else {
                    break;
                }
            }
            return x;
        };
    }

    function genCartesianProductSafe( seqs ) {
        var indices = [],
            done = false;

        (function() {
            var i;
            for(i = 0; i < seqs.length; i++) {
                indices.push( 0 );
            }
        }());

        return function() {
            if( done ) {
                return undefined;
            }
            var value = [],
                i;

            for(i = 0; i < seqs.length; i++) {
                value.push( seqs[i][ indices[i] ] );
            }

            i = 0;

            indices[i]++;

            while( i < seqs.length && indices[i] >= seqs[i].length ) {
                indices[i] = 0;
                i++;
                indices[i]++;
            }

            if( i >= seqs.length ) {
                done = true;
            }
            
            return value;
        };
    }

    function genCartesianProduct( seqs ) {
        if( !seqs.length ) {
            return fromArray( [[]] );
        }

        var prefixes = seqs[0];

        return Generator.concat.apply( null, prefixes.map( function(x) {
            var suffixgen = genCartesianProduct( seqs.slice(1) );
            return Generator.map( suffixgen, function(xs) {
                return [x].concat( xs );
            } );
        } ) );
    }

    function genCartesianPower( seq, n ) {
        var seqs = [], i;
        for(i = 0; i < n; i++) {
            seqs.push( seq );
        }
        return Generator.product.apply( null, seqs );
    }

    function forEach( g, f ) {
        var x = g();
        while( x !== undefined ) {
            f( x );

            x = g();
        }

        return null;
    }

    function filters( gen, fs ) {
        return genFilter( gen, function(x) {
            return fs.every( function(f) { return f(x); } );
        } );
    }
    
    function orderedSubseqsOfLength( seq, i ) {
        var gen = Generator.cartesianPower( [false,true], seq.length );

        gen = Generator.filter(
            gen,
            function(bools) {
                return Util.countIf( bools, Util.identity ) == i;
            } );

        gen = Generator.map(
            gen,
            function(bools) {
                var rv = [], i;
                for(i = 0; i < seq.length; i++) {
                    if( bools[i] ) {
                        rv.push( seq[i] );
                    }
                }
                return rv;
            }
        );
        
        return gen;
    }

    function orderedSubseqs( seq ) {
        // Subseqs, ordered from smallest sets to largest.
        var rv = [], i;
        for(i = 0; i <= seq.length; i++) {
            rv.push( function(i) {
                return orderedSubseqsOfLength( seq, i );
            }(i) );
        }
        return Generator.concat.apply( null, rv );
    }
    
    return {
        filter: genFilter,
        filters: filters,
        concat: onVarargs( genConcat ),
        map: genMap,
        fromArray: fromArray,
        toArray: toArray,
        take: genTake,
        takeGen: genTakeGen,
        forEach: forEach,
        product: onVarargs( genCartesianProductSafe ),
        cartesianPower: genCartesianPower,
        integers: integers,
        orderedSubseqs: orderedSubseqs
    };
}());

module.exports = Generator;
