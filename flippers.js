var canvas = null;
var ctx = null;
var jqcanvas = null;
var kb = null;

var cellsize = 70.0;
var boardOffset = {x: 70.0, y: 70.0};
var boardColumns = 5, boardRows = 5;
var buildMode = true;

var elements = [];

var gamestate = null;

var buildModeSerialization = null;

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
    return JSON.stringify( elements );
}

function unserializeGame( data ) {
    elements = JSON.parse( data );
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
    canvas.width = (2 + boardColumns) * cellsize;
    canvas.height = (2 + boardRows) * cellsize;

    jqcanvas = $(canvas);

    console.log( "Game beginning!");

    if( Modernizr.touch ) {
	console.log( "Touch events enabled" );
    } else {
	console.log( "Touch events not enabled" );
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
		 .click( loadLevel ) );
		 
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
}

function advanceWorld() {
    if( buildMode ) {
	return;
    }

    gamestate.phase += 0.04;
    while( gamestate.phase > 1.0 ) {
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
