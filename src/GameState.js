var Map2D = require("./Map2D");

module.exports = (function() {
    function defaultOrigin( boardsize ) {
	return  {col: Math.floor( boardsize.cols / 2 ),
		 row: boardsize.rows};
    }
    
    function defaultInitialVelocity( origin ) {
	return {dx: 0, dy: -1};
    }

    function defaultTarget( boardsize ) {
	return  {col: Math.floor( boardsize.cols / 2 ),
		 row: boardsize.rows};
    }

    function createBlankState( boardsize ) {
	return createState(
	    {
		size: boardsize,
		origin: defaultOrigin(boardsize),
		initialVelocity: defaultInitialVelocity( defaultOrigin(boardsize) ),
		target: defaultTarget(boardsize),
		elements: []
	    }
	);
    }
    
    function convertOldState( data ) {
	var sz = {cols: data.cols, rows: data.rows};
	return createState(
	    {
		size: sz,
		origin: defaultOrigin(sz),
		initialVelocity: defaultInitialVelocity( defaultOrigin(sz) ),
		target: defaultTarget(sz),
		elements: data.contents
	    }
	);
    };

    function decorateStateWithDefaults( state ) {
        var origin = state.origin || defaultOrigin( state.size );
        var vel = state.initialVelocity || defaultInitialVelocity( origin );
        var target = state.target || defaultTarget( state.size );
        return {
            size: state.size,
            origin: origin,
            initialVelocity: vel,
            target: target,
            elements: state.elements            
        };
    }

    function createState( state ) {
	var events = null;

        console.log( "foo " + JSON.stringify( state ) );

	function eventAtCell( cell ) {
	    if( events ) {
		return events.get( cell.col, cell.row );
	    }
	    return null;
	}
	
	function clearEvents() {
	    events = Map2D.create();
	}

	function setEvent( col, row, data ) {
	    if( !events ) {
		clearEvents();
	    }
	    events.set( col, row, data );
	}
	
	function elementAt( col, row ) {
	    for(var i = 0; i < state.elements.length; i++) {
		var flipper = state.elements[i];
		if( flipper.col == col && flipper.row == row ) {  
		    return flipper;
		}
	    }
	    return null;
	}
	
	function start() {
	    state.ball = {
		position: state.origin,
		incomingVelocity: state.initialVelocity,
		outgoingVelocity: state.initialVelocity
	    };
	    state.status = "running";
	}

	function stop() {
	    state.ball = null;
	    state.status = "stop";
	}

	function status() {
	    return state.status || "stopped";
	}
	
	function orthogonalBounce( direction ) {
	    return { dx: - direction.dx,
		     dy: - direction.dy };
	}

	function diagonalBounce( direction, ascending ) {
	    var m = ascending ? -1 : 1;
	    return { dx: m * direction.dy,
		     dy: m * direction.dx };
	}

	function squareCollision( ball, square ) {
	    if( square.type == "breakable-square" ) {
		setEvent( square.col,
			  square.row,
			  {type: "disappear",
                           begin: 0.0,
			   element: square} );
		removeElementAtCell( square );
	    }
	    ballEnters( ball.position,
			orthogonalBounce( ball.outgoingVelocity ) );
	}

        function triangleCollision( ball, triangle ) {
            var v = ball.outgoingVelocity;
            var n = [ {dx: -1, dy: 1},
                      {dx: 1, dy: 1},
                      {dx: 1, dy: -1},
                      {dx: -1, dy: -1} ][ triangle.rotation ];
            var angled = (v.dx == -n.dx) || (v.dy == -n.dy);
            var ascending = triangle.rotation % 2;
            // 32 
            // 01
            if( triangle.type == "breakable-triangle" ) {
		setEvent( triangle.col,
			  triangle.row,
			  {type: "disappear",
                           begin: angled ? 0.5 : 0.0,
			   element: triangle} );
		removeElementAtCell( triangle );                
            }
            if( !angled ) {
                ballEnters( ball.position,
                            orthogonalBounce( v ) );
            } else {
                state.ball = ball = {
                    position: {col: triangle.col,
                               row: triangle.row},
                    incomingVelocity: v,
                    outgoingVelocity: diagonalBounce( v, ascending )
                };
            }
        }

	function flipperCollision( ball, flipper ) {
	    var v = ball.incomingVelocity = ball.outgoingVelocity;

            var vertical = v.dy != 0;

	    ball.outgoingVelocity = diagonalBounce( v, flipper.ascending );
	    ball.position = {col: flipper.col,
			     row: flipper.row};
	    
	    setEvent( flipper.col,
		      flipper.row,
		      {type: "flip",
		       element: flipper,
                       ccw: vertical == flipper.ascending,
		       originallyAscending: flipper.ascending} );

	    flipper.ascending = !flipper.ascending;
	}

        function switchCollision( ball, element ) {
            var v = ball.outgoingVelocity;

	    if( !element.pressed ) {
		element.pressed = true;
		triggerSwitch( element );
	    }

            state.ball = ball = {
                position: {col: element.col,
                           row: element.row},
                incomingVelocity: v,
                outgoingVelocity: v
            };
        }

	function triggerSwitch( element ) {
	    onEachElement( function(switched) {
                if( switched.type != "switch"
                    && switched.colour == element.colour ) {
                    switched.deactivated = !switched.deactivated;
                    setEvent( switched.col,
                              switched.row,
                              {type: "toggle",
                               newActive: !switched.deactivated} );
                }
            } );
	}

	function leaveSwitch( element ) {
	    element.pressed = false;
	}

	var collisions = {
	    "flipper": flipperCollision,
	    "square": squareCollision,
	    "breakable-square": squareCollision,
	    "triangle": triangleCollision,
	    "breakable-triangle": triangleCollision,
            "switch": switchCollision
	};

	var onBallLeaves = {
	    "switch": leaveSwitch
	};
	
	function checkCell( pos ) {
	    return (pos.col >= 0
		    && pos.row >= 0
		    && pos.col < state.size.cols
		    && pos.row < state.size.rows);
	}

	function ballEnters( position, velocity ) {
	    var el = elementAt( position.col, position.row );

	    if( !el || el.deactivated ) {
		state.ball = {
		    position: position,
		    incomingVelocity: velocity,
		    outgoingVelocity: velocity
		};
	    } else {
		state.ball.outgoingVelocity = velocity;
		collisions[ el.type ]( state.ball, el );
	    }
	}

	function ballLeaves( position ) {
	    var el = elementAt( position.col, position.row );

	    if( !el || el.deactivated ) {
		return;
	    }

	    var f = onBallLeaves[ el.type ];
	    if( f ) {
		f( el );
	    }
	}

	function advance() {
	    if( state.status != "running" ) {
		return;
	    }

	    clearEvents();

	    var v = state.ball.outgoingVelocity;

	    var originalPosition = JSON.stringify( state.ball.position );

	    ballEnters( {col: state.ball.position.col + v.dx,
			 row: state.ball.position.row + v.dy },
			state.ball.outgoingVelocity );

	    var positionChanged = JSON.stringify( state.ball.position ) != originalPosition;
	    if( positionChanged ) {
		originalPosition = JSON.parse( originalPosition );
		ballLeaves( originalPosition );
	    }


	    if( !checkCell( state.ball.position ) ) {
		if( state.ball.position.col == state.target.col
		    &&
		    state.ball.position.row == state.target.row )
		{
		    state.status = "gameover:win";
		} else {
		    state.status = "gameover:loss";
		}
	    }
	}

	function save() {
	    return JSON.parse( JSON.stringify( state ) );
	}

	function onEachElement( f ) {
	    for(var key in state.elements) {
		f( state.elements[key] );
	    }
	}

	function render( gfx ) {
	    // Direct render function -- note that this object operates
	    // discretely. For better visuals we can use a layer above
	    // to show smooth animation.

	    gfx.setBoardSize( state.size );

	    gfx.drawBackground();

	    onEachElement( gfx.drawElement );

	    if( state.ball ) {
		gfx.drawBall( {x: (0.5 + state.ball.position.col),
			       y: (0.5 + state.ball.position.row) } );
	    }
	}

	function elementAtCell( cell ) {
	    return elementAt( cell.col, cell.row );
	}

        function arrayRemoveElement( arr, el ) {
            var index = arr.indexOf( el );
            if( index > -1 ) {
                arr.splice( index, 1 );
            }
        }

	function removeElementAtCell( cell ) {
	    var el = elementAtCell( cell );
	    if( el ) {
		arrayRemoveElement( state.elements, el );
	    }
	}

	function setElement( element ) {
	    removeElementAtCell( element ); // Note duck-typing
	    state.elements.push( element );
	}

	function onSquares( f ) {
	    for( var i = 0; i < state.size.cols; i++) {
		for(var j = 0; j < state.size.rows; j++) {
		    var cell = {col: i, row: j};
		    var element = elementAtCell( cell );
		    var event = eventAtCell( cell );
		    if( element || event ) {
			f( cell, element, event );
		    }
		}
	    }
	}

	return {
	    start: start,
	    stop: stop,
	    advance: advance,
	    status: status,
	    save: save,
	    render: render,
	    elementAtCell: elementAtCell,
	    eventAtCell: eventAtCell,
	    removeElementAtCell: removeElementAtCell,
	    setElement: setElement,
	    onSquares: onSquares,
	    ball: function(){ return state.ball; },
	    size: function(){ return state.size; }
	};	
    }

    function loadState( state ) {
        state = decorateStateWithDefaults( state );
        return createState( JSON.parse( JSON.stringify( state ) ) );
    }

    function loadOldState( state ) {
        return convertOldState( JSON.parse( JSON.stringify( state ) ) );
    }

    return {
	create: createBlankState,
	load: loadState,
	loadOld: loadOldState
    };
})();
