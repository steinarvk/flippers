var AABB = {create: function( rect ) {
    function inside( p ) {
        return p.x >= rect.x
            && p.y >= rect.y
            && p.x < (rect.x + rect.width)
            && p.y < (rect.x + rect.height);
    }
    
    function getRect() {
        return rect;
    }

    return {
        contains: inside,
        rect: getRect
    };
} };

var Mouse = { handle: function( root, options, handler ) {
    var context = null;

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
    }
    
    function extract( e ) {
	if( Modernizr.touch ) {
	    if( e.touches && e.touches.length > 0 ) {
		return {x: e.touches[0].pageX - root.style.left,
			y: e.touches[0].pageY - root.style.top};
	    }
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
    }
} };

var Map2D = (function() {
    function load( data ) {
	var m = create();
	for(var index = 0; index < data.length; index++) {
	    var i = data[index][0];
	    var j = data[index][1];
	    var v = data[index][2];
	    m.set( i, j, v );
	}
	return m;
    }

    function create() {
	var m = {};

	function set( i, j, data ) {
	    var is = i.toString();
	    var js = j.toString();
	    var submap = m[ is ];
	    if( !submap ) {
		submap  = m[ is ] = {};
	    }
	    submap[ js ] = data;
	}

	function remove( i, j ) {
	    var is = i.toString();
	    var js = j.toString();
	    var submap = m[ is ];
	    if( !submap ) {
		return;
	    }
	    delete submap[js];
	}

	function get( i, j ) {
	    var is = i.toString();
	    var js = j.toString();
	    var submap = m[ is ];
	    if( !submap ) {
		return undefined;
	    }
	    return submap[js];
	}

	function save() {
	    var rv = [];
	    for(var is in m) {
		var i = parseInt( is );
		for(var js in m[is]) {
		    var j = parseInt( js );
		    rv.push( [i, j, m[is][js]] );
		}
	    }
	    return rv;
	}
	
	return {
	    set: set,
	    remove: remove,
	    get: get,
	    save: save
	};
    }

    return {
	create: create,
	load: load
    };
} )();

var DiagramGraphics = { create: function(canvas, area, boardsize) {
    var ctx = canvas.getContext( "2d" );

    var cellsize = null;
    var offset = null;

    function drawBoard() {
	for(var i = 0; i < boardsize.cols; i++) {
            for(var j = 0; j < boardsize.rows; j++) {
		var isWhite = (i%2) == (j%2);
		ctx.fillStyle = isWhite ? "#caa" : "#aac";
		ctx.fillRect( offset.x + i * cellsize,
			      offset.y + j * cellsize,
			      cellsize,
			      cellsize );
            }
	}
    }
    
    function setBoardSize( sz ) {
	if( sz.cols == boardsize.cols && sz.rows == boardsize.rows ) {
	    return;
	}
	boardsize = sz;
	autofitBoard();
    }

    function autofitBoard() {
	var padding = 50.0;
	cellsize = Math.ceil(
	    (Math.min( (area.width - 2 * padding) / boardsize.cols,
		       (area.height - 2 * padding) / boardsize.rows ) / 2)
	) * 2;
	offset = {
	    x: area.x + (area.width - boardsize.cols * cellsize) * 0.5,
	    y: area.y + (area.height - boardsize.rows * cellsize) * 0.5
	};
    }


    function drawBall( pos ) {
	ctx.fillStyle = "#000";
	ctx.beginPath();
	ctx.arc( offset.x + pos.x * cellsize,
		 offset.y + pos.y * cellsize,
		 cellsize * 0.1,
		 0,
		 2 * Math.PI,
		 false );
	ctx.fill();
    }

    function center( cell ) {
	return {x: (cell.col + 0.5) * cellsize + offset.x,
		y: (cell.row + 0.5) * cellsize + offset.y};
    }
   
    function drawFlippingFlipper( thing, degrees ) {
	var c = center( thing );
	var r = cellsize * 0.5;
	var a = 2 * Math.PI * degrees / 360.0;
	var cosa = Math.cos( a );
	var sina = Math.sin( a );
	
	ctx.strokeStyle = colourOf( "red", thing.deactivated );
	ctx.beginPath();
	ctx.moveTo( c.x - r * cosa, c.y - r * sina );
	ctx.lineTo( c.x + r * cosa, c.y + r * sina );
	ctx.stroke();
    }

    function drawFlipper( thing ) {
	drawFlippingFlipper( thing, thing.ascending ? -45 : 45 );
    }
    
    function drawSquare( thing, options ) {
	var size = 1.0;
	var sp = 3;

	ctx.strokeStyle = colourOf( "red", thing.deactivated );

	if( options && options.disappear && options.disappear.phase ) {
	    size = 1.0 - 0.8 * options.disappear.phase;
	}

	var c = { x: offset.x + (0.5 + thing.col) * cellsize,
		  y: offset.y + (0.5 + thing.row) * cellsize };

	for(var i = 0; i < 5; i++) {
	    var r = cellsize * 0.5 * size * (0.6 + i * 0.1);
	    ctx.strokeRect( c.x - r,
			    c.y - r,
			    2 * r,
			    2 * r );
	}
    }
    
    function drawTriangle( thing ) {
	ctx.strokeStyle = colourOf( "red", thing.deactivated );
	var sp = 3;
	var dx = [-1,1,1,-1];
	var dy = [1,1,-1,-1];
	var cx = offset.x + (thing.col+0.5) * cellsize;
	var cy = offset.y + (thing.row+0.5) * cellsize;
	
	for(var i = 0; i < 5; i++) {
	    var begun = false;
	    var f = ctx.moveTo;
	    var x0, y0;
	    ctx.beginPath();
	    for(var j = 0; j < 4; j++) {
		if( j == thing.rotation ) continue;
		var x = cx + dx[j] * (cellsize * 0.5 - sp * i);
		var y = cy + dy[j] * (cellsize * 0.5 - sp * i);
		if( begun ) {
		    ctx.lineTo( x, y );
		} else {
		    x0 = x;
		    y0 = y;
		    ctx.moveTo( x, y );
		    begun = true;
		}
	    }
	    ctx.lineTo( x0, y0 );
	    ctx.stroke();
	}
    }
    
    function drawBreakableTriangle( thing, options ) {
	ctx.strokeStyle = colourOf( "red", thing.deactivated );
	var sp = 9;
	var size = 1;
	var dx = [-1,1,1,-1];
	var dy = [1,1,-1,-1];
	var cx = offset.x + (thing.col+0.5) * cellsize;
	var cy = offset.y + (thing.row+0.5) * cellsize;

	if( options && options.disappear && options.disappear.phase ) {
	    size = 1.0 - 0.8 * options.disappear.phase;
	}
	
	for(var i = 0; i < 2; i++) {
	    var begun = false;
	    var f = ctx.moveTo;
	    var x0, y0;
	    ctx.beginPath();
	    for(var j = 0; j < 4; j++) {
		if( j == thing.rotation ) continue;
		var x = cx + dx[j] * (cellsize * 0.5 * size * (0.75 + 0.25 * i));
		var y = cy + dy[j] * (cellsize * 0.5 * size * (0.75 + 0.25 * i));
		if( begun ) {
		    ctx.lineTo( x, y );
		} else {
		    x0 = x;
		    y0 = y;
		    ctx.moveTo( x, y );
		    begun = true;
		}
	    }
	    ctx.lineTo( x0, y0 );
	    ctx.stroke();
	}
    }
    
    function drawBreakableSquare( thing, options ) {
	var size = 1.0;

	ctx.strokeStyle = colourOf( "red", thing.deactivated );

	if( options && options.disappear && options.disappear.phase ) {
	    size = 1.0 - 0.8 * options.disappear.phase;
	}

	var c = { x: offset.x + (0.5 + thing.col) * cellsize,
		  y: offset.y + (0.5 + thing.row) * cellsize };

	for(var i = 0; i < 2; i++) {
	    var r = cellsize * 0.5 * size * (0.75 + i * 0.25);
	    ctx.strokeRect( c.x - r,
			    c.y - r,
			    2 * r,
			    2 * r );
	}
    }
    
    function drawSwitch( thing ) {
	ctx.fillStyle = colourOf( "red", thing.deactivated );
	ctx.beginPath();
	ctx.arc( offset.x + (thing.col+0.5) * cellsize,
		 offset.y + (thing.row+0.5) * cellsize,
		 cellsize * 0.5,
		 0,
		 2 * Math.PI,
		 false );
	ctx.fill();
    }

    var drawFunctions = {
	"flipper": drawFlipper,
	"square": drawSquare,
	"breakable-square": drawBreakableSquare,
	"switch": drawSwitch,
	"breakable-triangle": drawBreakableTriangle,
	"triangle": drawTriangle
    };

    function drawElement( thing ) {
	drawFunctions[thing.type]( thing );
    }

    function cellAtPosition( pos ) {
	var x = Math.floor( (pos.x - offset.x) / cellsize );
	var y = Math.floor( (pos.y - offset.y) / cellsize );
	if( x < 0
	    || y < 0
	    || x >= boardsize.cols
	    || y >= boardsize.rows ) {
	    return null;
	}
	return {col: x,
		row: y};
    }
    
    function linearClipAndScale( t, x0, x1 ) {
	return (t - x0) / (x1 - x0);
    }

    function drawFlippingEvent( event, t ) {
	t = linearClipAndScale( t, 0.4, 1.0 );
	if( t <= 0 ) {
	    drawFlipper( {col: event.element.col,
			  row: event.element.row,
			  ascending: event.originallyAscending } );
	} else if( t >= 1 ) {
	    drawFlipper( {col: event.element.col,
			  row: event.element.row,
			  ascending: !event.originallyAscending } );
	} else {
	    var a0 = event.originallyAscending ? -45 : 45;
	    var d = -90;
	    drawFlippingFlipper( event.element, a0 + t * d );
	}
	return true;
    }

    function drawDisappearingEvent( event, t ) {
	var renderer = drawFunctions[ event.element.type ];
	renderer( event.element,
		  {disappear: {phase: t}} );
	return true;
    }

    var drawEventFunctions = {
	"disappear": drawDisappearingEvent,
	"flip": drawFlippingEvent
    };

    function drawEvent( event, t ) {
	var f = drawEventFunctions[ event.type ];
	if( !f ) {
	    return false;
	}
	return f( event, t );
    }
    
    setBoardSize( boardsize );

    function drawColouredAABB( bb, colour ) {
        var col = colour || "#0f0";
	ctx.fillStyle = col;
        var r = bb.rect();
	ctx.fillRect( r.x,
                      r.y,
                      r.width,
                      r.height );
    }
        
    return {
	setBoardSize: setBoardSize,
	drawBackground: drawBoard,
	drawElement: drawElement,
	drawEvent: drawEvent,
	drawBall: drawBall,
	cellAtPosition: cellAtPosition,
        drawColouredAABB: drawColouredAABB
    };
} };

var GameState = (function() {
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

    function createState( state ) {
	var events = null;

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
			   element: square} );
		removeElementAtCell( square );
	    }
	    ballEnters( ball.position,
			orthogonalBounce( ball.outgoingVelocity ) );
	}

        function triangleCollision( ball, triangle ) {
            // 32 
            // 01
            if( triangle.type == "breakable-triangle" ) {
		setEvent( triangle.col,
			  triangle.row,
			  {type: "disappear",
			   element: triangle} );
		removeElementAtCell( triangle );                
            }
            var v = ball.outgoingVelocity;
            var n = [ {dx: -1, dy: 1},
                      {dx: 1, dy: 1},
                      {dx: 1, dy: -1},
                      {dx: -1, dy: -1} ][ triangle.rotation ];
            var angled = (v.dx == -n.dx) || (v.dy == -n.dy);
            var ascending = triangle.rotation % 2;
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
	    ball.outgoingVelocity = diagonalBounce( v, flipper.ascending );
	    ball.position = {col: flipper.col,
			     row: flipper.row};
	    
	    setEvent( flipper.col,
		      flipper.row,
		      {type: "flip",
		       element: flipper,
		       originallyAscending: flipper.ascending} );

	    flipper.ascending = !flipper.ascending;
	}

        function switchCollision( ball, element ) {
            var v = ball.outgoingVelocity;

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
            state.ball = ball = {
                position: {col: element.col,
                           row: element.row},
                incomingVelocity: v,
                outgoingVelocity: v
            };
        }

	var collisions = {
	    "flipper": flipperCollision,
	    "square": squareCollision,
	    "breakable-square": squareCollision,
	    "triangle": triangleCollision,
	    "breakable-triangle": triangleCollision,
            "switch": switchCollision
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

	function advance() {
	    if( state.status != "running" ) {
		return;
	    }

	    clearEvents();

	    var v = state.ball.outgoingVelocity;

	    ballEnters( {col: state.ball.position.col + v.dx,
			 row: state.ball.position.row + v.dy },
			state.ball.outgoingVelocity );


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
	}	
    }

    return {
	create: createBlankState,
	load: createState,
	loadOld: convertOldState
    }
})();

var SmoothGameState = { wrap: function( gamestate ) {
    var target = 40;
    var counter = 0;
    var timerId = null;

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

    function advance() {
	counter += 1;
	while( counter > target ) {
	    gamestate.advance()
	    counter -= target;
	}

	if( gamestate.status() != "running" ) {
	    stop();
	}
    }
    
    function running() {
	return timerId != null;
    }
    
    function start() {
	if( running() ) {
	    return;
	}
	
	timerId = setInterval( advance, 10 );
    }
    
    function stop() {
	if( !running() ) {
	    return;
	}
	
	clearInterval( timerId );
	timerId = null;
    }

    return {
	start: start,
	stop: stop,
	running: running,
	render: render
    }
} };

var predefinedLevels = {
    "Puzzle 2 -- place a single flipper":
    {"rows":7,"cols":7,"contents":[{"type":"flipper","col":6,"row":5,"ascending":true},{"type":"flipper","col":6,"row":1,"ascending":false},{"type":"flipper","col":4,"row":1,"ascending":true},{"type":"flipper","col":4,"row":3,"ascending":true},{"type":"flipper","col":3,"row":3,"ascending":true},{"type":"flipper","col":2,"row":3,"ascending":false},{"type":"flipper","col":2,"row":1,"ascending":false},{"type":"flipper","col":0,"row":1,"ascending":true}]},
    "Puzzle 3 -- place a single flipper":
    {rows: 9,
     cols: 9,
     contents:
     [{"type":"flipper","col":4,"row":2,"ascending":true},{"type":"flipper","col":7,"row":6,"ascending":true},{"type":"flipper","col":7,"row":2,"ascending":false},{"type":"flipper","col":7,"row":8,"ascending":true},{"type":"flipper","col":3,"row":8,"ascending":false},{"type":"flipper","col":3,"row":4,"ascending":true},{"type":"flipper","col":6,"row":4,"ascending":false},{"type":"flipper","col":6,"row":7,"ascending":true},{"type":"flipper","col":1,"row":7,"ascending":false},{"type":"flipper","col":1,"row":2,"ascending":true},{"type":"flipper","col":0,"row":6,"ascending":true},{"type":"flipper","col":0,"row":8,"ascending":false},{"type":"flipper","col":0,"row":4,"ascending":false},{"type":"flipper","col":0,"row":1,"ascending":true},{"type":"flipper","col":4,"row":1,"ascending":true}]},
    "Puzzle 4 -- place one breakable square": {cols: 5,
					       rows: 5,
					       contents: [{"type":"flipper","col":0,"row":4,"ascending":false},{"type":"flipper","col":4,"row":4,"ascending":true},{"type":"flipper","col":4,"row":0,"ascending":false},{"type":"flipper","col":0,"row":0,"ascending":true},{"type":"breakable-square","col":2,"row":0},{"type":"flipper","col":2,"row":4,"ascending":true}]},
    "Puzzle 5 -- place one flipper": {cols: 5,
				      rows: 5,
				      contents: [{"type":"flipper","col":2,"row":2,"ascending":true},{"type":"flipper","col":3,"row":2,"ascending":true},{"type":"flipper","col":3,"row":1,"ascending":false},{"type":"flipper","col":1,"row":1,"ascending":true},{"type":"flipper","col":1,"row":3,"ascending":false},{"type":"flipper","col":4,"row":3,"ascending":true},{"type":"flipper","col":4,"row":0,"ascending":false},{"type":"flipper","col":0,"row":0,"ascending":true},{"type":"flipper","col":0,"row":4,"ascending":false}] },
    "Puzzle 6 (by zyzzyva and kaw) -- place one flipper": {cols: 5,
							   rows: 5,
							   contents: [{"type":"flipper","col":1,"row":0,"ascending":true},{"type":"breakable-square","col":2,"row":0},{"type":"flipper","col":4,"row":0,"ascending":false},{"type":"square","col":0,"row":1},{"type":"flipper","col":2,"row":1,"ascending":false},{"type":"square","col":3,"row":1},{"type":"flipper","col":0,"row":2,"ascending":true},{"type":"flipper","col":2,"row":2,"ascending":false},{"type":"flipper","col":3,"row":2,"ascending":false},{"type":"flipper","col":4,"row":2,"ascending":true},{"type":"flipper","col":1,"row":3,"ascending":false},{"type":"flipper","col":2,"row":3,"ascending":true},{"type":"flipper","col":3,"row":3,"ascending":true},{"type":"flipper","col":4,"row":3,"ascending":true},{"type":"flipper","col":0,"row":4,"ascending":false}] },
    "Puzzle 7 -- place two flippers":
    {"rows":7,"cols":7,"contents":[{"type":"flipper","col":4,"row":2,"ascending":false},{"type":"flipper","col":3,"row":1,"ascending":true},{"type":"flipper","col":5,"row":1,"ascending":false},{"type":"flipper","col":5,"row":3,"ascending":true},{"type":"flipper","col":5,"row":4,"ascending":true},{"type":"flipper","col":4,"row":4,"ascending":false},{"type":"flipper","col":2,"row":2,"ascending":true},{"type":"flipper","col":2,"row":3,"ascending":false},{"type":"flipper","col":1,"row":0,"ascending":false},{"type":"flipper","col":0,"row":0,"ascending":true},{"type":"flipper","col":0,"row":3,"ascending":false},{"type":"flipper","col":1,"row":3,"ascending":true}]},
    "Puzzle 8 -- place two breakable blocks":
    {"rows":5,"cols":5,"contents":[{"type":"flipper","col":2,"row":4,"ascending":true},{"type":"square","col":3,"row":4},{"type":"flipper","col":0,"row":2,"ascending":true},{"type":"flipper","col":0,"row":1,"ascending":true},{"type":"flipper","col":1,"row":0,"ascending":true},{"type":"flipper","col":2,"row":0,"ascending":false},{"type":"flipper","col":3,"row":0,"ascending":false},{"type":"flipper","col":3,"row":1,"ascending":false},{"type":"square","col":4,"row":1},{"type":"flipper","col":4,"row":3,"ascending":true},{"type":"flipper","col":4,"row":2,"ascending":false},{"type":"flipper","col":0,"row":4,"ascending":false},{"type":"flipper","col":1,"row":2,"ascending":false},{"type":"breakable-square","col":1,"row":3},{"type":"breakable-square","col":2,"row":2}]}
};

function colourOf( base, deactivated ) {
    if( deactivated ) {
	return "#755";
    }
    return "#f55";
}

function arrayRemoveElement( ar, element ) {
    var i = ar.indexOf( element );
    if( i > -1 ) {
	ar.splice( i, 1 );
    }
}

function elementDeactivatable( element ) {
    return element.type != "switch";
}

function cycleElement( cell, element ) {
    var newElement = null;

    if( element
	&& !element.deactivated
	&& elementDeactivatable( element ) ) {
	newElement = element;
	newElement.deactivated = true;
    } else if( element && element.rotation ) {
	newElement = element;
	newElement.rotation -= 1;
	newElement.deactivated = false;
    } else if( !element ) {
	newElement = {type: "flipper", col: cell.col, row: cell.row, ascending: true };
    } else if( element.type == "flipper" && element.ascending ) {
	newElement = {type: "flipper", col: cell.col, row: cell.row, ascending: false };
    } else if( element.type == "flipper" && !element.ascending ) {
	newElement = {type: "square", col: cell.col, row: cell.row };
    } else if( element.type == "square" ) {
	newElement = {type: "breakable-square", col: cell.col, row: cell.row };
    } else if( element.type == "breakable-square" ) {
	newElement = {type: "switch", col: cell.col, row: cell.row };
    } else if( element.type == "switch" ) {
	newElement = {type: "triangle", col: cell.col, row: cell.row, rotation: 3 };
    } else if( element.type == "triangle" ) {
	newElement = {type: "breakable-triangle", col: cell.col, row: cell.row, rotation: 3 };
    }

    if( newElement ) {
	return newElement;
    }

    return {type: "flipper", col: element.col, row: element.row, ascending: false };
}

function initialize() {
    var canvasWidth = 480;
    var canvasHeight = 480;

    canvas = document.createElement( "canvas" );
    canvas.id = "flippersCanvas";
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    jqcanvas = $(canvas);

    var myState = GameState.loadOld(
	{"rows":7,"cols":7,"contents":[{"type":"flipper","col":4,"row":2,"ascending":false},{"type":"flipper","col":3,"row":1,"ascending":true},{"type":"flipper","col":5,"row":1,"ascending":false},{"type":"flipper","col":5,"row":3,"ascending":true},{"type":"flipper","col":5,"row":4,"ascending":true},{"type":"flipper","col":4,"row":4,"ascending":false},{"type":"flipper","col":2,"row":2,"ascending":true},{"type":"flipper","col":2,"row":3,"ascending":false},{"type":"flipper","col":1,"row":0,"ascending":false},{"type":"flipper","col":0,"row":0,"ascending":true},{"type":"flipper","col":0,"row":3,"ascending":false},{"type":"flipper","col":1,"row":3,"ascending":true}]}
    );
    var mySmoothState = null;
    var mySavedState = null;

    myState.start();

    function render( gfx ) {
	if( mySmoothState ) {
	    mySmoothState.render( gfx );
	} else {
	    myState.render( gfx );
	}
    }

    function setState( newstate ) {
	myState = newstate;
	mySmoothState = null;
    }

    function startGame() {
	mySavedState = myState.save();
	myState.start();
	mySmoothState = SmoothGameState.wrap( myState );
	mySmoothState.start();
    }

    function stopGame() {
	setState( GameState.load( mySavedState ) );
    }

    function running() {
	return mySmoothState != null;
    }

    function toggleGame() {
	if( running() ) {
	    stopGame();
	} else {
	    startGame();
	}
    }

    function saveLevel() {
	return JSON.stringify( myState.save() );
    }

    function loadLevel( data ) {
	setState( GameState.load( JSON.parse( data ) ) );
    }

    console.log( "Game beginning!");

    var dropdown = $( "<select/>", {id: "predefinedLevelSelector"} );
    for(var name in predefinedLevels) {
	$( "<option/>", {value: name,
			 text: name} ).appendTo( dropdown );
    }

    $("#flippersGame")
	.append( jqcanvas )
	.append( $(document.createElement("br")) )
	.append( $(document.createElement("button"))
		 .attr( "id", "startstopbutton" )
		 .html( "Start" )
		 .click( toggleGame ) )
	.append( $(document.createElement("textarea"))
		 .attr( "id", "leveldata" ) )
	.append( $(document.createElement("button"))
		 .attr( "id", "savebutton" )
		 .html( "Save" )
		 .click( function() {
		     $("#leveldata").val( saveLevel() );
		 } ) )
	.append( $(document.createElement("button"))
		 .attr( "id", "loadbutton" )
		 .html( "Load" )
		 .click( function() {
		     var data = $("#leveldata").val();
		     console.log( "loading " + data );
		     loadLevel( data );
		 } ) )
	.append( dropdown )
	.append( $("<button/>")
		 .html( "Load predefined" )
		 .click( function() {
		     var key = dropdown.val();
		     var level = predefinedLevels[ key ];
		     if( !level ) {
			 console.log( "No such level!" );
			 return;
		     }
		     setState( GameState.loadOld( level ) );
		 } ) );
		 
    ctx = canvas.getContext( "2d" );
    jqcanvas = $("#flippersCanvas");


    var gamegraphics = DiagramGraphics.create( canvas,
					      {x: 0,
					       y: 0,
					       width: 480,
					       height: 480},
					      {cols: 9,
					       rows: 9}
					    );

    var testRegion = AABB.create( {x: 10, y: 20, width: 20, height: 100} );

    Mouse.handle(
	canvas,
	{holdDelay: 500},
	function( click ) {
            if( testRegion.contains( click ) ) {
                return {
                    hold: function() {
                        console.log( "region was held" );
                    },
                    tap: function() {
                        console.log( "region was tapped" );
                    }
                }
            }

	    var cell = gamegraphics.cellAtPosition( click );
	    if( !cell ) {
		return;
	    }

	    return {
		hold: function( m ) {
		    myState.removeElementAtCell( cell );
		},
		tap: function( m ) {
		    var element = cycleElement( cell,
						myState.elementAtCell( cell ) );
		    myState.setElement( element );
		}
	    }
	}
    );

    setInterval( function() {
	ctx.clearRect( 0, 0, canvas.width, canvas.height );
        gamegraphics.drawColouredAABB( testRegion, "blue" );
	render( gamegraphics );
    }, 1000.0 / 30.0 );
}

function declareResult( result ) {
    console.log( "declaring result: " + result );

    var proclamation = $("#flippersGameResult");
    
    if( !proclamation.length ) {
	proclamation = $(document.createElement( "p" ));
	$("#flippersGame").append( proclamation
				   .attr( "id", "flippersGameResult" ) );
    }

    if( result == "win" ) {
	proclamation.html( "Puzzle cleared!" );
    } else {
	proclamation.html( "Try again" );
    }
}

