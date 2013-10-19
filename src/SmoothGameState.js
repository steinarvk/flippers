"use strict";

var SteadyTimer = require("./SteadyTimer");

module.exports = { wrap: function( gamestate ) {
    var target = 40,
        counter = 0,
        timer = null,
        tickCounter = 0,
        lastCatchup = null;

    function phase() {
        return counter / target;
    }

    function interpolatedBallPosition( ball ) {
        var cx = (ball.position.col + 0.5),
            cy = (ball.position.row + 0.5),
            t, v;
        if( (counter * 2) < target ) {
            t = (counter / target) * 2;
            v = ball.incomingVelocity;
            return {
                x: cx + 0.5 * v.dx * (t-1),
                y: cy + 0.5 * v.dy * (t-1)
            };
        }

        t = ((counter - target/2) / target) * 2;
        v = ball.outgoingVelocity;
        return {
            x: cx + 0.5 * v.dx * t,
            y: cy + 0.5 * v.dy * t
        };
    }

    function render(gfx) {
        var ball = gamestate.ball(),
            t = phase();
        gfx.setBoardSize( gamestate.size() );
        
        gfx.drawBackground();

        gfx.drawGoals( gamestate.origin(), gamestate.target() );

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

    function resetTickCounter() {
        tickCounter = 0;
    }

    function getTickCounter() {
        return tickCounter;
    }

    function running() {
        return timer.running();
    }
    
    function stop() {
        if( !running() ) {
            return;
        }

        lastCatchup = null;

        timer.stop();
    }

    function advance() {
        tickCounter += 1;
        counter += 1;
        while( counter > target ) {
            gamestate.advance();
            counter -= target;
        }

        if( gamestate.status() !== "running" ) {
            stop();
        }
    }

    function catchup() {
        if( !timer.running() ) {
            return;
        }
        var now = new Date().getTime(),
            delta;

        if( lastCatchup ) {
            delta = now - lastCatchup;
            timer.addTime( delta );
        }
        lastCatchup = now;
    }
    
    function start() {
        if( running() ) {
            return;
        }
        
        timer.start();
    }
    
    timer = SteadyTimer.create( 7.0,
                                advance,
                                {manual: true} );

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
