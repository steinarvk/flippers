"use strict";

var fs = require("fs");
var Util = require("./Util");
var Solver = require("./Solver");
var StateMutation = require("./StateMutation");

var FinisherUtil = (function() {
    function verifySolution( solution ) {
        return Solver.solve( solution ).result === "win";
    }

    function logger(name) {
        return function(message) {
            console.log( "[ " + name + "] " + message );
        };
    }

    function findBadSolutions( puzzle, goodSolReq ) {
        var badSolutions = Solver.search( puzzle );
        badSolutions = badSolutions.filter( Util.negate( goodSolReq ) );
        return badSolutions;
    }

    function puzzleMutations( puzzle, n, req ) {
        var i, rv = [], mutation;
        for(i = 0; i < n; i++) {
            mutation = StateMutation.mutateAdditive( puzzle );
            if( mutation && (!req || req(mutation)) ) {
                rv.push( mutation );
            }
        }
        return rv;
    }

    function refinePuzzle( name, puzzle, goodSolReq, i ) {
        var log = logger(name),
            badSolutions = findBadSolutions( puzzle, goodSolReq ),
            mutations;

        if( !badSolutions.length ) {
            log( "puzzle is unambiguous! " + JSON.stringify( puzzle ) );
            return puzzle;
        }
        if( i > 2 ) {
            return null;
        }

        mutations = puzzleMutations(
            puzzle,
            50,
            function(mutated) {
                var rv;
                mutated.inventory = puzzle.inventory;
                rv = Solver.search( mutated ).filter( goodSolReq ).length > 0;
                log( "accept: " + rv );
                return rv;
            } );

        if( !mutations.length ) {
            log( "unable to find any mutations" );
            return null;
        }

        log( "found " + mutations.length + " mutations" );
        
        mutations = mutations.map( function(mutation) {
            return [findBadSolutions( mutation, goodSolReq ).length,
                    mutation];
        } );

        mutations.sort();

        log( "best mutation has " + mutations[0][0] + " bad solutions (from " + badSolutions.length + ")" );

        return refinePuzzle( name,
                             (mutations[0][0] < badSolutions.length)
                             ? mutations[0][1]
                             : puzzle
                             , goodSolReq, i + 1);
    }

    function processFile( filename, data ) {
        console.log( "Processing: " + filename );
        
        var puzzle = JSON.parse( data ),
            solutions = Solver.search( puzzle ),
            bestSolution,
            bestTicks;


        bestSolution = Util.bestBy(
            solutions,
            function( sol1, sol2 ) {
                return Solver.solve( sol1 ).ticks > Solver.solve( sol2 ).ticks;
            } );

        if( !bestSolution ) {
            console.log( "No solution found for " + filename);
            return;
        }

        bestTicks = Solver.solve( bestSolution ).ticks;
        
        refinePuzzle( filename, puzzle, function(solution) {
            return Solver.solve( solution ).ticks >= bestTicks;
        } );
    }

    function main() {
        var filenames = Util.normalizeArguments( arguments );
        filenames.forEach( function(filename) {
            fs.readFile( filename, "utf8", function(err, data) {
                if( err ) {
                    console.log( "Error reading " + data + " (" + err + ")" );
                } else {
                    processFile( filename, data );
                }
            } );
        } );
    }
    
    return {
        main: main
    };
}());

module.exports = FinisherUtil;
