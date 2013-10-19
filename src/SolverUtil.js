"use strict";

var fs = require("fs");

var Solver = require("./Solver");
var Util = require("./Util");
var Map2D = require("./Map2D" );

var SolverUtil = (function() {
    function analyzeSolution( solution ) {
        var bounces = 0,
            rollovers = 0,
            switches = 0,
            areaCovered = [],
            stretches = [],
            movedSinceInteraction = 0,
            stretchCounts = null,
            untouchedPieces = Map2D.create(),
            touchedPieces = Map2D.create(),
            i,
            result;

        for( i = 0; i < solution.elements.length; i++ ) {
            untouchedPieces.set( solution.elements[i].col,
                                 solution.elements[i].row,
                                 true );
        }

        function flushInteraction() {
            stretches.push( movedSinceInteraction );
            movedSinceInteraction = 0;
        }
        
        result = Solver.solve( solution, { hooks: {
            onBallMoved: function( newCell, velocity ) {
                areaCovered.push( [ newCell.col, newCell.row ].toString() );
                ++movedSinceInteraction;
            },
            onInteraction: function( element, ballVel ) {
                // element is before
                areaCovered.push( [ element.col, element.row ].toString() );
                flushInteraction();
                if( element.type === "switch" ) {
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

        return {
            noninteractiveConnections: stretchCounts["0"] || 0,
            bounces: bounces,
            ticks: result.ticks,
            switches: switches,
            rollovers: rollovers,
            squaresVisited: areaCovered,
            untouchedPieces: untouchedPieces.count(),
            multitouchedPieces: touchedPieces.save().map( Util.getter(2) ).filter( Util.greaterThan( 1 ) ).length
        };
    }

    function summarizeSolution( report, output ) {
        output( "Total elements",
                report.solution.elements.length );
        output( "Ticks taken",
                report.analysis.ticks );
        output( "Switches",
                report.analysis.switches );
        output( "Rollovers",
                report.analysis.rollovers );
        output( "Squares visited",
                report.analysis.squaresVisited );
        output( "Noninteractive connections",
                report.analysis.noninteractiveConnections );
        output( "Complexity (bounces)",
                report.analysis.bounces );
        output( "Never-hit pieces",
                report.analysis.untouchedPieces );
        output( "Multi-hit pieces",
                report.analysis.multitouchedPieces );
    }

    function main( filenames ) {
        var i, j, t0, t1, dt, filename, solutions, data;

        function onValue( name, value ) {
            console.log( "  " + name + ": " + value );
        }

        for(i = 0; i < filenames.length; i++) {
            filename = filenames[i];
            console.log( "=== " + filename + "===" );
            data = JSON.parse( fs.readFile( filename, "utf8" ) );
            t0 = new Date().getTime();
            solutions = SolverUtil.analyzePuzzle( data );
            t1 = new Date().getTime();
            dt = t1 - t0;
            console.log( " " + solutions.length
                         + " solution(s) found in "
                         + dt + "ms" );
            for(j = 0; j < solutions.length; j++) {
                console.log( " == Solution " + (j+1) + " ==" );
                summarizeSolution( solutions[j], onValue );
            }
        }
    }

    function analyzePuzzle( puzzle ) {
        var solutions = Solver.search( puzzle );
        return solutions.map( function( solution ) {
            return {solution: solution,
                    analysis: analyzeSolution( solution )};
        } );
    }

    return {
        main: main,
        summarizeSolution: summarizeSolution,
        analyzePuzzle: analyzePuzzle,
        analyzeSolution: analyzeSolution
    };
}());

module.exports = SolverUtil;
