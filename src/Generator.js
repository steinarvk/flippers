"use strict";

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

    function forEach( g, f ) {
        var x = g();
        while( x !== undefined ) {
            f( x );

            x = g();
        }

        return null;
    }
    
    return {
        filter: genFilter,
        concat: onVarargs( genConcat ),
        map: genMap,
        fromArray: fromArray,
        toArray: toArray,
        take: genTake,
        forEach: forEach,
        product: onVarargs( genCartesianProduct ),
        integers: integers
    };
}());

module.exports = Generator;
