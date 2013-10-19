"use strict";

var GameState = require("./GameState");

var Util = require("./Util");
var Generator = require("./Generator");

var Solver = (function() {
    function setupContext(state) {
	return {ticks: 0};
    }
    
    function observeState( context, game ) {
	context.ticks++;
    }

    function reportState( context, game ) {
	var result = null;
	if( game.status() === "gameover:win" ) {
	    result = "win";
	} else if( game.status() === "gameover:loss" ) {
	    result = "loss";
	}

	return {ticks: context.ticks,
		result: result,
		position: game.ball().position,
		velocity: game.ball().outgoingVelocity};
    }

    function solve( state, options ) {
	var limit = (options && options.limit) || 1000,
            game,
            key;

	if( state.origin ) {
	    game = GameState.load( state );
	} else {
	    game = GameState.loadOld( state );
	}

        if( options && options.hooks ) {
            for(key in options.hooks) {
                if( options.hooks.hasOwnProperty(key) ) {
                    game.addHook( key, options.hooks[key] );
                }
            }
        }

	var context = setupContext( game.save() );

	game.start();

	for(var i = 0; i < limit; i++) {
	    observeState( context, game );

	    if( game.status() != "running" ) {
		break;
	    }

	    game.advance();
	}

	return reportState( context, game );
    }

    function pieceConfigurations( piece ) {
        function adjoin(m) {
            return Util.merge( piece, m );
        }
        var rv = [];
        if( piece.type === "triangle" || piece.type === "breakable-triangle") {
            for(var i = 0; i < 4; i++) {
                rv.push( adjoin( {rotation: 0} ) );
            }
        } else if( piece.type === "flipper" ) {
            rv.push( adjoin( {ascending: true} ) );
            rv.push( adjoin( {ascending: false} ) );
        } else {
            rv.push( adjoin( {} ) );
        }
        return rv;
    }

    function search( puzzle, options ) {
	// Puzzle has .inventory, and is otherwise a start state.
	// We can expect that each puzzle expands to ~ 2 x 40^puzzle.inventory.length potential solutions
	// This means we're capable of naive exhaustive search for up to around 3 puzzle pieces, meaning most puzzles.
	// We can also cut down the search space by adjoining a piece at a time and always placing it
	// in the path of the ball.
	// (However, note that this means we would have to try all possible orders of placing the puzzle pieces.)

	// Naive search
	var baseState = GameState.load( puzzle );
	var moveCells = [];
	for(var i = 0; i < puzzle.size.cols; i++) {
	    for( var j = 0; j < puzzle.size.rows; j++) {
		var cell = {col: i, row: j};
		if( !baseState.elementAtCell( cell ) ) {
		    moveCells.push( cell );
		}
	    }
	}

	var sets = [];
	var solutions = [];

	for(var i = 0; i < puzzle.inventory.length; i++) {
	    sets.push( moveCells );
	    sets.push( pieceConfigurations( puzzle.inventory[i] ) );
	}

        var gen = Generator.filter(
	    Generator.product.apply( null, sets ),
	    function ( moves ) {
		// Check that all the locations are unique
		for(var i = 0; i < moves.length; i += 2) {
		    if( moves.indexOf( moves[i] ) < i ) {
			return false;
		    }
		}
		return true;
	    }
	);
        
        var count = 0;

        Generator.forEach( gen, function( n ) {
	    var state = GameState.load( puzzle );

	    for(var i = 0; i < n.length; i += 2) {
		var cell = n[i];
		var piece = n[i+1];
		state.setElement( Util.merge( cell, piece ) );
	    }

	    var result = Solver.solve( state.save() );
	    if( result.result === "win" ) {
		solutions.push( state.save() );
	    }

            ++count;
	} );

//        console.log( "Solution space (size = " + count + ") searched" );

	return Util.uniqueElements( solutions );
    }

    return {
	solve: solve,
	search: search
    };
})();

module.exports = Solver;
