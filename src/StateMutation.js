"use strict";

var Random = require( "./Random" );
var Util = require( "./Util" );
var GameState = require( "./GameState" );

var StateMutation = (function() {
    function generateRandomBlackElement(type) {
        if( !type ) {
            return generateRandomBlackElement(
                Random.choice( [ "flipper",
                                 "square",
                                 "breakable-square",
                                 "triangle",
                                 "breakable-triangle" ] )
            );
        }

        if( type === "flipper" ) {
            return {type: type,
                    ascending: Random.choice( [true,false] )};
        }

        if( type === "breakable-triangle" || type === "triangle" ) {
            return {type: type,
                    rotation: Random.choice( [0,1,2,3] )};
        }

        if( type === "breakable-square" || type === "square" ) {
            return {type: type};
        }

        throw {message: "unknown type " + type};
    }

    function mutateAdditive( data ) {
        var state = GameState.load( data ),
            candidates = [];

        state.onEmptyCells( Util.compose( Util.jsonCopy,
                                          Util.collector( candidates ) ) );

        if( !candidates.length ) {
            return null;
        }

        state.setElement( Util.merge( Random.choice( candidates ),
                                      generateRandomBlackElement() ) );

        return state.save();
    }

    return {
        mutateAdditive: mutateAdditive
    };
}());

module.exports = StateMutation;
