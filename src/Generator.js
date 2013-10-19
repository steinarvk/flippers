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
        console.log( "generating product of seq len " + seqs.length );
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
    
    return {
        filter: genFilter,
        filters: filters,
        concat: onVarargs( genConcat ),
        map: genMap,
        fromArray: fromArray,
        toArray: toArray,
        take: genTake,
        forEach: forEach,
        product: onVarargs( genCartesianProductSafe ),
        cartesianPower: genCartesianPower,
        integers: integers
    };
}());

module.exports = Generator;
