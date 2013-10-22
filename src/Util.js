"use strict";

var Util = (function() {
    function quantile( arr, pct ) {
        arr = JSON.parse( JSON.stringify( arr ) );
        arr.sort( function(a,b) { return a-b; } );
        return arr[ Math.floor( pct * arr.length ) ];
    }

    function arrayMin( arr ) {
	return Math.min.apply( null, arr );
    }

    function zip( f ) {
	var rv = [],
            args = normalizeArguments( arguments );
	args.splice( 0, 1 );
	
	zip_.apply( null, 
		    [ compose( f,
                               collector(rv) ) ].concat( args ) );


	return rv;
    }

    function zip_( f ) {
	var args = normalizeArguments( arguments ),
            minLength, i, subargs = [];
	args.splice( 0, 1 );

	minLength = arrayMin( args.map( getter("length") ) );

	for(i = 0; i < minLength; i++) {
	    f.apply( null, args.map( getter(i) ) );
	}

	return null;
    }

    function nameArray( names, arr ) {
	var rv = [];
	zip_( function( name, el ) {
	    rv[ name ] = el;
	}, names, arr );
	return rv;
    }
    
    function arrayRemoveElement( ar, element ) {
        var i = ar.indexOf( element );
        if( i > -1 ) {
            ar.splice( i, 1 );
        }
    }
    
    function endsWith( s, suffix ) {
        return s.indexOf( suffix, s.length - suffix.length ) !== -1;
    }
    
    function rectCenter( rect ) {
        return {x: rect.x + 0.5 * rect.width,
                y: rect.y + 0.5 * rect.height};
    }
    
    function rectInnerRadius( rect ) {
        return Math.min( 0.5 * rect.width, 0.5 * rect.height );
    }
    
    function uniqueElements( xs ) {
        var rv = [],
            m = {},
            i, x;
        for(i = 0; i < xs.length; i++) {
            x = xs[i];
            if( !m[x] ) {
                rv.push( x );
            }   
            m[x] = true;
        }
        return rv;
    }
    
    function mergeInto() {
        var argsArray = [].slice.apply( arguments ),
            rv = argsArray.shift(),
            i, key;
        for(i = 0; i < argsArray.length; i++) {
            for(key in argsArray[i]) {
                if( argsArray[i].hasOwnProperty(key) ) {
                    rv[ key ] = argsArray[i][key];
                }
            }
        }
        return rv;
    }
    
    function merge() {
        var argsArray = [].slice.apply( arguments ),
            arrayPrime = [{}].concat( argsArray );
        return mergeInto.apply( null, arrayPrime );
    }
    
    function arrayCounts( arr ) {
        var rv = {}, k, i;
        for(i = 0; i < arr.length; i++) {
            k = arr[i];
            if( rv[k] === "undefined" ) {
                rv[k] = 1;
            } else {
                rv[k]++;
            }
        }
        return rv;
    }
    
    function getter( k ) {
        return function( m ) {
            return m[k];
        };
    }
    
    function greaterThan( v ) {
        return function( x ) {
            return x > v;
        };
    }
    
    function inc(x) { return x + 1; }
    
    function collector(target) {
        return function(x) {
            target.push( x );
        };
    }
    
    function normalizeArguments(x) {
        return [].slice.apply( x );
    }
    
    function jsonCopy(x) {
        return JSON.parse( JSON.stringify( x ) );
    }

    function jsonEqual(x, y) {
        return JSON.stringify(x) === JSON.stringify(y);
    }
    
    function compose() {
        var fs = normalizeArguments( arguments ),
            f = fs.shift(),
            nf = null;
        
        if( !fs.length ) {
            return f;
        }
        
        nf = compose.apply( null, fs );
        
        return function() {
            return nf( f.apply( null, arguments ) );
        };
    }
    
    function identity(x) {
        return x;
    }
    
    function countIf( arr, f ) {
        var i = 0, rv = 0;
        while( i < arr.length ) {
            if( f( arr[i] ) ) {
                rv++;
            }
            i++;
        }
        return rv;
    }
    
    function indexIf( arr, f ) {
        var i = 0;
        while( i < arr.length ) {
            if( f( arr[i] ) ) {
                return i;
            }
            i++;
        }
        return -1;
    }

    function appliedOn( args ) {
        return function( f ) {
            return f.apply( null, args );
        };
    }
    
    function multisetsEqual( arr1, arr2, eq ) {
        var count1, count2, i;
        
        if( !eq ) {
            eq = function(a,b) { return a === b; };
        }
        
        function mkCmp(x) {
            return function(y) {
                return eq(x, y);
            };
        }
        
        for(i = 0; i < arr1.length; i++) {
            count1 = Util.countIf( arr1, mkCmp( arr1[i] ) );
            count2 = Util.countIf( arr2, mkCmp( arr1[i] ) );
            if( count1 !== count2 ) {
                return false;
            }
        }
        
        for(i = 0; i < arr2.length; i++) {
            count1 = Util.countIf( arr1, mkCmp( arr2[i] ) );
            count2 = Util.countIf( arr2, mkCmp( arr2[i] ) );
            if( count1 !== count2 ) {
                return false;
            }
        }

        return true;
    }

    function bestBy( arr, f ) {
        var i, rv = null;
        if( arr.length > 0 ) {
            rv = arr[0];
            for(i = 1; i < arr.length; i++) {
                if( f( arr[i], rv ) ) {
                    rv = arr[i];
                }
            }
        }
        return rv;
    }

    function negate(f) {
        return function(x) {
            return f(x);
        };
    }

    return {
        arrayRemoveElement: arrayRemoveElement,
        arrayCounts: arrayCounts,
        endsWith: endsWith,
        rectCenter: rectCenter,
        rectInnerRadius: rectInnerRadius,
        greaterThan: greaterThan,
        getter: getter,
        merge: merge,
        inc: inc,
        quantile: quantile,
        mergeInto: mergeInto,
        uniqueElements: uniqueElements,
        collector: collector,
        compose: compose,
        normalizeArguments: normalizeArguments,
        jsonCopy: jsonCopy,
        jsonEqual: jsonEqual,
        identity: identity,
        negate: negate,
        countIf: countIf,
        appliedOn: appliedOn,
        bestBy: bestBy,
        multisetsEqual: multisetsEqual,
	zip: zip,
	zip_: zip_,
	arrayMin: arrayMin,
        nameArray: nameArray
    };
}());

module.exports = Util;














