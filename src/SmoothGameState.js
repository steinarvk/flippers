var SteadyTimer = require("./SteadyTimer");

module.exports = { wrap: function( gamestate ) {
    var target = 40;
    var counter = 0;
    var timer = SteadyTimer.create( 7.0,
                                    advance,
                                    {manual: true} );

    function phase() {
	return counter / target;
    }

    function interpolatedBallPosition( ball ) {
	var cx = (ball.position.col + 0.5);
	var cy = (ball.position.row + 0.5);
	if( (counter * 2) < target ) {
	    var t = (counter / target) * 2;
	    var v = ball.incomingVelocity;
	    return {
		x: cx + 0.5 * v.dx * (t-1),
		y: cy + 0.5 * v.dy * (t-1)
	    };
	} else {
	    var t = ((counter - target/2) / target) * 2;
	    var v = ball.outgoingVelocity;
	    return {
		x: cx + 0.5 * v.dx * t,
		y: cy + 0.5 * v.dy * t
	    };
	}
    }

    function render(gfx) {
	gfx.setBoardSize( gamestate.size() );
	
	gfx.drawBackground();

	var ball = gamestate.ball();

	var t = phase();

	gamestate.onSquares( function(cell, element, event) {
	    var drewEvent = false;
	    if( event && gfx.drawEvent ) {
		drewEvent = gfx.drawEvent( event, t );
	    }
	    if( !drewEvent && element ) {
		gfx.drawElement( element, t );
	    }
	} );

	if( !ball ) {
	    return;
	}

	gfx.drawBall( interpolatedBallPosition( ball ) );
    }

    var tickCounter = 0;

    function resetTickCounter() {
        tickCounter = 0;
    }

    function getTickCounter() {
        return tickCounter;
    }

    function advance() {
        tickCounter += 1;
	counter += 1;
	while( counter > target ) {
	    gamestate.advance()
	    counter -= target;
	}

	if( gamestate.status() != "running" ) {
	    stop();
	}
    }

    var lastCatchup = null;

    function catchup() {
        if( !timer.running() ) {
            return;
        }
        var now = new Date().getTime();
        if( lastCatchup ) {
            var delta = now - lastCatchup;
            timer.addTime( delta );
        }
        lastCatchup = now;
    }
    
    function running() {
        return timer.running();
    }
    
    function start() {
	if( running() ) {
	    return;
	}
        
        timer.start();
    }
    
    function stop() {
	if( !running() ) {
	    return;
	}

        lastCatchup = null;

        timer.stop();
    }

    return {
	start: start,
	stop: stop,
	running: running,
	render: render,
        tickCounter: getTickCounter,
        resetTickCounter: resetTickCounter,
        catchup: catchup
    };
} };
