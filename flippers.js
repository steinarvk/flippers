var canvas = null;
var ctx = null;
var jqcanvas = null;
var kb = null;

var cellsize = 60.0;
var boardColumns = 5, boardRows = 5;
var buildMode = true;
var canvasWidth = 480;
var canvasHeight = 480;
var boardOffset = {x: (canvasWidth - boardColumns * cellsize) * 0.5,
		   y: (canvasHeight - boardRows * cellsize) * 0.5};

var elements = [];

var gamestate = null;

var buildModeSerialization = null;

var predefinedLevels = {
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
    "Puzzle 3 -- place a single flipper":
    {rows: 9,
     cols: 9,
     contents:
     [{"type":"flipper","col":4,"row":2,"ascending":true},{"type":"flipper","col":7,"row":6,"ascending":true},{"type":"flipper","col":7,"row":2,"ascending":false},{"type":"flipper","col":7,"row":8,"ascending":true},{"type":"flipper","col":3,"row":8,"ascending":false},{"type":"flipper","col":3,"row":4,"ascending":true},{"type":"flipper","col":6,"row":4,"ascending":false},{"type":"flipper","col":6,"row":7,"ascending":true},{"type":"flipper","col":1,"row":7,"ascending":false},{"type":"flipper","col":1,"row":2,"ascending":true},{"type":"flipper","col":0,"row":6,"ascending":true},{"type":"flipper","col":0,"row":8,"ascending":false},{"type":"flipper","col":0,"row":4,"ascending":false},{"type":"flipper","col":0,"row":1,"ascending":true},{"type":"flipper","col":4,"row":1,"ascending":true}]},
    "Puzzle 2 -- place a single flipper":
    {"rows":7,"cols":7,"contents":[{"type":"flipper","col":6,"row":5,"ascending":true},{"type":"flipper","col":6,"row":1,"ascending":false},{"type":"flipper","col":4,"row":1,"ascending":true},{"type":"flipper","col":4,"row":3,"ascending":true},{"type":"flipper","col":3,"row":3,"ascending":true},{"type":"flipper","col":2,"row":3,"ascending":false},{"type":"flipper","col":2,"row":1,"ascending":false},{"type":"flipper","col":0,"row":1,"ascending":true}]}
};

function colourOf( base, deactivated ) {
    if( deactivated ) {
	return "#755";
    }
    return "#f55";
}

function startRun() {
    if( !buildMode ) {
	return;
    }
	
    $("#startstopbutton").html( "Stop" );

    buildMode = false;
    gamestate = initialGameState();

    buildModeSerialization = serializeGame();

    $("#loadbutton").prop( "disabled", true );
    $("#savebutton").prop( "disabled", true );
}

function stopRun() {
    if( buildMode ) {
	return;
    }

    $("#startstopbutton").html( "Start" );

    buildMode = true;
    gamestate = null;

    if( buildModeSerialization ) {
	unserializeGame( buildModeSerialization );
    }

    $("#loadbutton").prop( "disabled", false );
    $("#savebutton").prop( "disabled", false );
}

function saveLevel() {
    $("#leveldata").val( serializeGame() );
}

function loadLevel() {
    unserializeGame( $("#leveldata").val() );
}

function serializeGame() {
    return JSON.stringify(
	{rows: boardRows,
	 cols: boardColumns,
	 contents: elements}
    );
}

function autofitBoard() {
    var padding = 50.0;
    cellsize = Math.ceil(
	(Math.min( (canvasWidth - 2 * padding) / boardColumns,
		   (canvasHeight - 2 * padding) / boardRows ) / 2)
    ) * 2;
    boardOffset = {
	x: (canvasWidth - boardColumns * cellsize) * 0.5,
	y: (canvasHeight - boardRows * cellsize) * 0.5
    };
}

function unserializeGame( data ) {
    var x = JSON.parse( data );
    boardColumns = x.cols;
    boardRows = x.rows;
    elements = x.contents;

    autofitBoard();
}

function initialGameState() {
    return {col: Math.floor( boardColumns / 2 ),
	    row: boardRows,
	    phase: 0.0,
	    d1: {x: 0, y: -1},
	    d2: {x: 0, y: -1}};
}

function elementAt( col, row ) {
    for(var i = 0; i < elements.length; i++) {
	var flipper = elements[i];
	if( flipper.col == col && flipper.row == row ) {  
	    return flipper;
	}
    }
    return null;
}

function diagonalBounce( direction, ascending ) {
    var m = ascending ? -1 : 1;
    return { x: m * direction.y,
	     y: m * direction.x };
}

function onEachElement( f ) {
    for(var key in elements) {
	f( elements[key] );
    }
}

function nextState( lastState ) {
    var dir = lastState.d2;
    var colp = lastState.col + dir.x;
    var rowp = lastState.row + dir.y;
    var element = elementAt( colp, rowp );
    var phasep = lastState.phase - 1.0;
    
    if( !element || element.deactivated ) {
	return { col: colp,
		 row: rowp,
		 phase: phasep,
		 d1: dir,
		 d2: dir };
    }
    if( element.type == "flipper" ) {
	return { col: colp,
		 row: rowp,
		 phase: phasep,
		 d1: dir,
		 d2: diagonalBounce( dir, element.ascending ),
		 resolve: function() {
		     element.ascending = !element.ascending;
		 }
	       };
    }
    if( element.type == "square" || element.type == "breakable-square" ) {
	if( element.type == "breakable-square" ) {
	    removeElement( element );
	}
	return nextState( { col: colp,
			    row: rowp,
			    phase: phasep + 1.0,
			    d2: {x: -dir.x, y: -dir.y } } );
    }
    if( element.type == "switch" ) {
	onEachElement( function(el) {
	    if( elementDeactivatable(el) ) {
		el.deactivated = ! el.deactivated;
	    }
	} );
	return { col: colp,
		 row: rowp,
		 phase: phasep,
		 d1: dir,
		 d2: dir };
    }
}

function cellAtPosition( pos ) {
    var x = (pos.x - boardOffset.x) / cellsize;
    var y = (pos.y - boardOffset.y) / cellsize;
    if( x < 0 || y < 0 || x >= boardColumns || y >= boardRows ) {
	return null;
    }
    return { col: Math.floor( x ),
	     row: Math.floor( y ) };
}

function printObject( o ) {
    for(var k in o) {
	console.log( "key " + k + ": " + o[k] );
    }
}

function getClickPosition( e ) {
    if( Modernizr.touch ) {
	console.log( "translating touch " );
	if( e.touches && e.touches.length > 0 ) {
	    return {x: e.touches[0].pageX - jqcanvas.offset().left,
		    y: e.touches[0].pageY - jqcanvas.offset().top};
	}
    } else {
	return {
	    x: e.pageX - jqcanvas.offset().left,
	    y: e.pageY - jqcanvas.offset().top
	};
    }
}

function arrayRemoveElement( ar, element ) {
    var i = ar.indexOf( element );
    if( i > -1 ) {
	ar.splice( i, 1 );
    }
}

function removeElement( elt ) {
    arrayRemoveElement( elements, elt );
}

function elementDeactivatable( el ) {
    return el.type != "switch";
}

function toggleElementAt( cell ) {
    if( !buildMode ) {
	return;
    }

    var element = elementAt( cell.col, cell.row );
    if( element ) {
	removeElement( element );
    }

    var newElement = null;

    if( element && !element.deactivated && elementDeactivatable( element ) ) {
	newElement = element;
	newElement.deactivated = true;
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
    }

    if( newElement ) {
	elements.push( newElement );
    }
}

function handleClick( pos ) {
    console.log( "handling click at " + JSON.stringify( pos ) );

    var cell = cellAtPosition( pos );
    if( !cell ) {
	return;
    }

    toggleElementAt( cell );
}

function toggleGame() {
    if( buildMode ) {
	startRun();
    } else {
	stopRun();
    }
}

function begin() {
    canvas = document.createElement( "canvas" );
    canvas.id = "flippersCanvas";
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    jqcanvas = $(canvas);

    console.log( "Game beginning!");

    if( Modernizr.touch ) {
	console.log( "Touch events enabled" );
    } else {
	console.log( "Touch events not enabled" );
    }

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
		 .click( saveLevel ) )
	.append( $(document.createElement("button"))
		 .attr( "id", "loadbutton" )
		 .html( "Load" )
		 .click( loadLevel ) )
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
		     if( !buildMode ) {
			 console.log( "Not in build mode!" );
			 return;
		     }
		     unserializeGame( JSON.stringify( level ) );
		 } ) );
    
		 
    ctx = canvas.getContext( "2d" );
    jqcanvas = $("#flippersCanvas");

    if( Modernizr.touch ) {
	console.log( "using touch events" );

	canvas.ontouchstart = function(e) {
	    e.preventDefault();
	    handleClick( getClickPosition( e ) );
	}
    } else {
	canvas.onclick = function(e) {
	    e.preventDefault();
	    handleClick( getClickPosition( e ) );
	}
    }

    setInterval( drawFrame, 1000.0 / 30.0 );
    setInterval( advanceWorld, 15.0 );

    elements = [];
}

function stepWorld() {
    if( gamestate.resolve ) {
	gamestate.resolve();
    }
    gamestate = nextState( gamestate );

    var result = checkGameOver( gamestate );
    if( result ) {
	declareResult( result );
	stopRun();
    }
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

function targetCell() {
    return {col: Math.floor( boardColumns / 2 ),
	    row: -1};
}

function checkGameOver( state ) {
    if( state.col < 0 || 
	state.row < 0 ||
	state.col >= boardColumns ||
	state.row >= boardRows ) {
	var target = targetCell();
	if( state.col == target.col && state.row == target.row ) {
	    return "win";
	}
	return "loss";
    }
}


function advanceWorld() {
    if( buildMode ) {
	return;
    }

    gamestate.phase += 0.04;
    while( gamestate && gamestate.phase > 1.0 ) {
        stepWorld();
    }
}

function ballPosition() {
    var cx = (gamestate.col+0.5);
    var cy = (gamestate.row+0.5);

    if( gamestate.phase < 0.5 ) {
        var t = 2 * gamestate.phase;
        var d = gamestate.d1;
        var dx = -0.5 * (1-t) * d.x;
        var dy = -0.5 * (1-t) * d.y;
        return {x: cellsize * (cx+dx), y: cellsize * (cy+dy)};
    } else {
        var t = 2 * (gamestate.phase - 0.5);
        var d = gamestate.d2;
        var dx = 0.5 * t * d.x;
        var dy = 0.5 * t * d.y;
        return {x: cellsize * (cx+dx), y: cellsize * (cy+dy)};
    }
}

function drawFrame() {
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    
    drawChessboard( {cols: boardColumns, rows: boardRows} );
    
    onEachElement( drawThing );

    if( gamestate ) {
	var pos = ballPosition();
	drawBall( pos.x, pos.y );
    }
}

function drawBall( cx, cy ) {
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc( boardOffset.x + cx,
	     boardOffset.y + cy,
	     5.0,
	     0,
	     2 * Math.PI,
	     false );
    ctx.fill();
}

function drawFlipper( thing ) {
    var col = thing.col;
    var row = thing.row;
    var type = thing.ascending;
    var xleft = col * cellsize + boardOffset.x;
    var xright = (col+1) * cellsize + boardOffset.x;
    var ytop = row * cellsize + boardOffset.y;
    var ybottom = (row+1) * cellsize + boardOffset.y;
    ctx.strokeStyle = colourOf( "red", thing.deactivated );
    ctx.beginPath();
    if( type ) {
        ctx.moveTo( xleft, ybottom );
        ctx.lineTo( xright, ytop );
    } else {
        ctx.moveTo( xright, ybottom );
        ctx.lineTo( xleft, ytop );
    }
    ctx.stroke();
}

function drawSquare( thing ) {
    ctx.strokeStyle = colourOf( "red", thing.deactivated );
    var sp = 3;
    for(var i = 0; i < 5; i++) {
	ctx.strokeRect( boardOffset.x + thing.col * cellsize + sp * i,
			boardOffset.y + thing.row * cellsize + sp * i,
			cellsize - 2 * sp * i,
			cellsize - 2 * sp * i);
    }
}

function drawBreakableSquare( thing ) {
    ctx.strokeStyle = colourOf( "red", thing.deactivated );
    var sp = 9;
    for(var i = 0; i < 2; i++) {
	ctx.strokeRect( boardOffset.x + thing.col * cellsize + sp * i,
			boardOffset.y + thing.row * cellsize + sp * i,
			cellsize - 2 * sp * i,
			cellsize - 2 * sp * i);
    }
}

function drawSwitch( thing ) {
    ctx.fillStyle = colourOf( "red", thing.deactivated );
    ctx.beginPath();
    ctx.arc( boardOffset.x + (thing.col+0.5) * cellsize,
	     boardOffset.y + (thing.row+0.5) * cellsize,
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
    "switch": drawSwitch
}

function drawThing( thing ) {
    drawFunctions[ thing.type ]( thing );
}

function drawChessboard( size ) {
    for(var i = 0; i < size.cols; i++) {
        for(var j = 0; j < size.rows; j++) {
            var isWhite = (i%2) == (j%2);
            ctx.fillStyle = isWhite ? "#caa" : "#aac";
            ctx.fillRect( boardOffset.x + i * cellsize,
			  boardOffset.y + j * cellsize,
			  cellsize,
			  cellsize );
        }
    }
}

window.onload = begin;
