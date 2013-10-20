"use strict";

var Generator = require("./Generator");
var Util = require("./Util");
var GameState = require( "./GameState" );
var Solver = require( "./Solver" );

var StateFilter = (function() {
    function successful() {
        return function(state) {
            return Solver.solve( state ).result == "win";
        };
    }

    function nontrivial() {
        return function(state) {
            var bounced = false;
            Solver.solve( state, { hooks: {
                onInteraction: function( element ) {
                    if( element.type !== "switch" ) {
                        bounced = true;
                    }
                }
            } } );
            return bounced;
        };
    }

    function uniqueSolution() {
        return function(puzzle) {
            var solutions = Solver.search( puzzle ),
                rv = false;
            if( solutions.length === 1 ) {
//                console.log( "solution elements len " +  solutions[0].elements.length );
//                console.log( "inv len " +  puzzle.inventory.length );
//                console.log( "puzzle el len " +  puzzle.elements.length );
                rv = (solutions[0].elements.length
                      === (puzzle.elements.length + puzzle.inventory.length));
            }
            return rv;
        };
    }
    
    return {
        nontrivial: nontrivial,
        successful: successful,
        uniqueSolution: uniqueSolution
    };
}());

module.exports = StateFilter;
