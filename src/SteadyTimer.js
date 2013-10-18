"use strict";

module.exports = {create: function( target, hook, options ) {
    var currentId = null,
        lastTime = null,
        accumulated = 0,
        isRunning = false;

    function addTime( delta ) {
        accumulated += delta;
        while( accumulated >= target ) {
            hook();
            accumulated -= target;
        }
    }

    function onTrigger() {
        var now = new Date().getTime();
        if( lastTime ) {
            addTime( now - lastTime );
        }
        lastTime = now;
    }
    
    function stop() {
        if( currentId ) {
            clearInterval( currentId );
            currentId = null;
        }
        isRunning = false;
    }

    function start() {
        stop();
        if( !options.manual ) {
            currentId = setInterval( onTrigger, 0.5 * target );
        }
        isRunning = true;
    }

    function running() {
        return isRunning;
    }

    return {
        start: start,
        stop: stop,
        running: running,
        addTime: addTime
    };
} };
