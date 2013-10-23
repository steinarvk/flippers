"use strict";

var SteadyTimer = require("./SteadyTimer");

var Stopwatch = {create: function() {
    var t = 0,
        isRunning = false,
        t0 = null;

    function start() {
        t0 = new Date().getTime();
        isRunning = true;
    }

    function flush() {
        var t1 = new Date().getTime();
        if( isRunning ) {
            t += (t1 - t0) / 1000.0;
            t0 = t1;
        }
    }

    function running() {
        return isRunning;
    }

    function stop() {
        flush();
        isRunning = false;
        t0 = null;
    }

    function reset() {
        stop();
        t = 0;
    }

    function get() {
        flush();
        return t;
    }

    function decrease(dt) {
        t -= dt;
    }

    return {
        start: start,
        stop: stop,
        reset: reset,
        get: get,
        decrease: decrease,
        running: running
    };
} };

module.exports = { wrap: function( gamestate ) {
    var timer = Stopwatch.create(),
        lastCatchup = null,
        speed = 3;

    function phase() {
        var t = timer.get();
        while( (t*5) > 1.0 ) {
            gamestate.advance();
            if( gamestate.status() !== "running" ) {
                stop();
            }

            timer.decrease( 1/speed );
            t = timer.get();
        }
        return t * speed;
    }

    function interpolatedBallPosition( ball, t ) {
        var cx = (ball.position.col + 0.5),
            cy = (ball.position.row + 0.5),
            v;
        if( t < 0.5 ) {
            t = t * 2;
            v = ball.incomingVelocity;
            return {
                x: cx + 0.5 * v.dx * (t-1),
                y: cy + 0.5 * v.dy * (t-1)
            };
        }

        t = (t - 0.5) * 2;
        v = ball.outgoingVelocity;
        return {
            x: cx + 0.5 * v.dx * t,
            y: cy + 0.5 * v.dy * t
        };
    }

    function render(gfx) {
        var t = phase(),
            ball = gamestate.ball();

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

        console.log( JSON.stringify( interpolatedBallPosition( ball, t ) ) );
        gfx.drawBall( interpolatedBallPosition( ball, t ) );
    }

    function running() {
        return timer.running();
    }
    
    function stop() {
        if( !running() ) {
            return;
        }

        timer.stop();
    }

    function start() {
        if( running() ) {
            return;
        }

        timer.start();
    }

    function catchup() {
    }
    
    return {
        start: start,
        stop: stop,
        running: running,
        render: render,
        catchup: catchup
    };
} };
