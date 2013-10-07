module.exports = { create: function( root, options, handler ) {
    var context = null;

    var lastPosition = null;

    function handleMove( e ) {
        lastPosition = extract( e );
    }

    function getLastPosition() {
        return lastPosition;
    }

    function now() {
	return new Date().getTime();
    }

    function down(pos) {
	var rv = handler( pos );
	if( !rv ) {
	    return;
	}
	var ctx = {
	    time: now(), 
	    click: pos,
	    handlers: rv
	};
	context = ctx;
	if( rv.hold && options.holdDelay ) {
	    window.setTimeout( function() {
		if( context != ctx ) {
		    return;
		}
		trigger( "hold" );
	    }, options.holdDelay );
	}

        if( Modernizr.touch ) {
            lastPosition = pos;
        }
    }

    function trigger( type, pos ) {
	var ctx = context;
	context = null;
	if( !ctx ) {
	    return;
	}

	var f = ctx.handlers[type];
	if( f ) {
	} else {
	    console.log( "no handler for: " + type );
	}

	var ms = now() - ctx.time;
	
	f( { click: ctx.click,
	     duration: now() - ctx.time,
	     release: pos } );
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
	} else {
	    return {
		x: e.pageX - root.style.left,
		y: e.pageY - root.style.top
	    };
	}
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
