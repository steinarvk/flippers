var GameState = require("./GameState");

var Solver = (function() {
    function setupContext(state) {
	return {ticks: 0};
    }
    
    function observeState( context, game ) {
	context.ticks++;
    }

    function reportState( context, game ) {
	var result = null;
	if( game.status() == "gameover:win" ) {
	    result = "win";
	} else if( game.status() == "gameover:loss" ) {
	    result = "loss";
	}

	return {ticks: context.ticks,
		result: result,
		position: game.ball().position,
		velocity: game.ball().outgoingVelocity};
    }

    function solve( state, options ) {
	var limit = (options && options.limit) || 1000;
	var game = null;
	if( state.origin ) {
	    game = GameState.load( state );
	} else {
	    game = GameState.loadOld( state );
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
		if( !baseState.elementAt( cell ) ) {
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
	    Generator.cartesianProduct( sets ),
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
	
	while(true) {
	    var state = JSON.parse( JSON.stringify( puzzle ) );
	    var n = gen();

	    if( n === undefined ) {
		break;
	    }

	    for(var i = 0; i < n.length; i += 2) {
		var cell = n[i];
		var piece = n[i+1];
		state.setElement( $.extend( {},
					    cell,
					    piece ) );
	    }

	    var result = Solver.solve( state );
	    if( result.result == "win" ) {
		solutions.push( JSON.stringify( state ) );
	    }
	}

	return Util.uniqueElements( solutions ).map( JSON.parse );
    }

    return {
	solve: solve,
	search: search
    };
})();

module.exports = Solver;
