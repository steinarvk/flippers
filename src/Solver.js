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

    return {
	solve: solve
    };
})();

module.exports = Solver;
