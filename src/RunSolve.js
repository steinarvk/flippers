"use strict";

var fs = require("fs");
var Solver = require("./Solver");
var Util = require("./Util");
var Map2D = require("./Map2D" );

var args = process.argv.splice(2);

var filename = args[0];

var data = JSON.parse( fs.readFileSync( filename, "utf8" ) );

var solutions = Solver.search( data );

var n = solutions.length;

if( n === 1 ) {
    (function () {
        console.log( "Single solution found." );
        
        var bounces = 0;
        var rollovers = 0;
        var switches = 0;
        
        var areaCovered = [];
        
        var stretches = [];
        var movedSinceInteraction = 0;

        var stretchCounts = null;

        var untouchedPieces = Map2D.create();
        var touchedPieces = Map2D.create();
        var i;

        for( i = 0; i < solutions[0].elements.length; i++ ) {
            untouchedPieces.set( solutions[0].elements[i].col,
                                 solutions[0].elements[i].row,
                                 true );
        }

        function flushInteraction() {
            stretches.push( movedSinceInteraction );
            movedSinceInteraction = 0;
        }
        
        var result = Solver.solve( solutions[0], { hooks: {
            onBallMoved: function( newCell, velocity ) {
                areaCovered.push( [ newCell.col, newCell.row ].toString() );
                ++movedSinceInteraction;
            },
            onInteraction: function( element, ballVel ) {
                // element is before
                areaCovered.push( [ element.col, element.row ].toString() );
                flushInteraction();
                if( element.type == "switch" ) {
                    ++switches;
                } else {
                    ++bounces;
                }
                untouchedPieces.remove( element.col, element.row );
                touchedPieces.adjust( element.col, element.row, function(x) {
                    if( x ) {
                        return x + 1;
                    }
                    return 1;
                } );
            },
            onRollover: function( element, velocity ) {
                areaCovered.push( [ element.col, element.row ].toString() );
                ++rollovers;
            }
        } } );
        
        areaCovered = Util.uniqueElements( areaCovered ).length;
        
        stretchCounts = Util.arrayCounts( stretches );

        var noninteractiveConnections = stretchCounts["0"] || 0;
n
        var twiceHitPieces = touchedPieces.save()
                .map( Util.getter(2) )
                .filter( Util.greaterThan( 1 ) )
                .length;

        console.log( "Total elements: " + solutions[0].elements.length );
        
        console.log( "Ticks taken: " + result.ticks );
        console.log( "" );
        console.log( "Switches: " + switches );
        console.log( "Rollovers: " + rollovers );
        console.log( "Squares visited: " + areaCovered );
        console.log( "" );
        console.log( "Noninteractive connections: " + noninteractiveConnections );
        console.log( "Complexity (bounces): " + bounces );
        console.log( "Never-hit pieces: " + untouchedPieces.count() );
        console.log( "Multi-hit pieces: " + twiceHitPieces );

    }());
} else if( n === 0 ) {
    console.log( "No solutions found!" );
} else {
    console.log( "Multiple solutions found! (" + n + " solutions)" );
}



