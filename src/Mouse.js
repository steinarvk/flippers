"use strict";

/*globals Modernizr */
/*jslint browser: true */

module.exports = { create: function( root, options, handler ) {
    var context = null,
        lastPosition = null;

    function getLastPosition() {
        return lastPosition;
    }

    function now() {
        return new Date().getTime();
    }

    function trigger( type, pos ) {
        var ctx = context, f;

        context = null;
        if( !ctx ) {
            return;
        }

        f = ctx.handlers[type];
        if( !f ) {
            console.log( "no handler for: " + type );
            return;
        }

        f( { click: ctx.click,
             duration: now() - ctx.time,
             release: pos } );
    }

    function down(pos) {
        var rv = handler( pos ),
            ctx;
        if( !rv ) {
            return;
        }

        ctx = {
            time: now(), 
            click: pos,
            handlers: rv
        };
        context = ctx;

        if( rv.hold && options.holdDelay ) {
            window.setTimeout( function() {
                if( context !== ctx ) {
                    return;
                }
                trigger( "hold" );
            }, options.holdDelay );
        }

        if( Modernizr.touch ) {
            lastPosition = pos;
        }
    }

    function up( pos ) {
        trigger( "tap", pos );
        if( Modernizr.touch ) {
            lastPosition = null;
        }
    }
    
    function extract( e ) {
        if( Modernizr.touch ) {
            if( e.touches && e.touches.length > 0 ) {
                return {x: e.touches[0].pageX - root.style.left,
                        y: e.touches[0].pageY - root.style.top};
            }
            return null;
        }
        return {
            x: e.pageX - root.style.left,
            y: e.pageY - root.style.top
        };
    }
    
    function handleDown( e ) {
        var pos = extract(e);
        e.preventDefault();
        down( pos );
    }

    function handleUp( e ) {
        var pos = extract(e);
        e.preventDefault();
        up( pos );
    }

    function handleMove( e ) {
        lastPosition = extract( e );
    }

    if( Modernizr.touch ) {
        console.log( "setting up mouse handling for touch" );
        root.ontouchstart = handleDown;
        root.ontouchend = handleUp;
    } else {
        console.log( "setting up mouse handling for mouse" );
        console.log( "element " + root );
        root.onmousedown = handleDown;
        root.onmouseup = handleUp;
        root.onmousemove = handleMove;
    }

    return {
        lastPosition: getLastPosition
    };
} };
