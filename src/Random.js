"use strict";

var Util = require("./Util");

var Random = (function() {
    function integer( n ) {
        return Math.floor( Math.random() * n );
    }

    function choice( arr ) {
        var index = Math.floor( Math.random() * arr.length );
        return arr[index];
    }

    function range(n) {
        var i = 0, rv = [];
        for(i = 0; i < n; i++) {
            rv.push( i );
        }
        return rv;
    }

    function drawWithoutReplacement( arr, n ) {
        if( n > arr.length ) {
            return null;
        }

        var indices = range( n ),
            rv = [],
            i, index;

        for(i=0;i<n;i++) {
            index = choice( indices );
            Util.arrayRemoveElement( indices, index );
            rv.push( arr[index] );
        }

        return rv;
    }

    function removingDrawWithoutReplacement( arr, n ) {
        if( n > arr.length ) {
            return null;
        }

        var i, index, rv = [];

        for(i=0;i<n;i++) {
            index = integer( arr.length );
            rv.push( arr.splice( index, 1 )[0] );
        }

        return rv;

    }

    function choices( arrs ) {
        var rv = [], i;
        for(i = 0; i < arrs.length; i++) {
            rv.push( choice( arrs[i] ) );
        }
        return rv;
    }
    
    function sequence( f, n ) {
        var rv = "",
            i;
        for(i = 0; i < n; i++) {
            rv += f();
        }
        return rv;
    }

    function generateDigits( n ) {
        return sequence( function(){ return choice( "0123456789" ); },
                         n );
    }

    function generateLetters( n ) {
        return sequence( function(){ return choice( "abcdefghijklmnopqruvwxyz" ); },
                         n );
    }
    
    return {
        integer: integer,
        choice: choice,
        choices: choices,
        draw: drawWithoutReplacement,
        removingDraw: removingDrawWithoutReplacement,
        digits: generateDigits,
        letters: generateLetters
    };
}());

module.exports = Random;
