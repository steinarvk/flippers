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
    
    return {
        nontrivial: nontrivial,
        successful: successful
    };
}());

module.exports = StateFilter;
