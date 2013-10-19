"use strict";

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

module.exports = {
    arrayRemoveElement: arrayRemoveElement,
    arrayCounts: arrayCounts,
    endsWith: endsWith,
    rectCenter: rectCenter,
    rectInnerRadius: rectInnerRadius,
    greaterThan: greaterThan,
    getter: getter,
    merge: merge,
    inc: inc,
    mergeInto: mergeInto,
    uniqueElements: uniqueElements
};
