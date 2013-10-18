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

function merge() {
    var rv = {},
        i, key;
    for(i = 0; i < arguments.length; i++) {
        for(key in arguments[i]) {
            if( arguments[i].hasOwnProperty(key) ) {
                rv[ key ] = arguments[i][key];
            }
        }
    }
    return rv;
}

module.exports = {
    arrayRemoveElement: arrayRemoveElement,
    endsWith: endsWith,
    rectCenter: rectCenter,
    rectInnerRadius: rectInnerRadius,
    merge: merge,
    uniqueElements: uniqueElements
};
