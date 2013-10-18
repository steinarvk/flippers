"use strict";

var Random = (function() {
    
    function choice( arr ) {
        var index = Math.floor( Math.random() * arr.length );
        return arr[index];
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
        choice: choice,
        digits: generateDigits,
        letters: generateLetters
    };
}());

module.exports = Random;
