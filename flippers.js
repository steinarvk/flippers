var canvas = null;
var ctx = null;
var jqcanvas = null;

var cellsize = 50.0;
var boardOffset = {x: cellsize, y: cellsize};
var boardColumns = 9, boardRows = 9;

function flipper( col, row, ascending ) {
    return { type: "flipper",
	     col: col,
	     row: row,
	     ascending: ascending };
}

var elements = [
    flipper( 0, 0, true ),
    flipper( 3, 0, false ),
    flipper( 1, 3, true ),
    flipper( 4, 8, false ),
    flipper( 1, 8, false ),
    flipper( 3, 3, true ),
    flipper( 0, 1, false ),
    flipper( 0, 7, false ),
    flipper( 4, 7, true ),
    flipper( 3, 1, false )
];

var gamestate = {
    col: 4,
    row: 9,
    phase: 0.0,
    d1: {x: 0, y: -1},
    d2: {x: 0, y: -1}
};

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

function nextState( lastState ) {
    var dir = lastState.d2;
    var colp = lastState.col + dir.x;
    var rowp = lastState.row + dir.y;
    var element = elementAt( colp, rowp );
    var phasep = lastState.phase - 1.0;
    
    if( !element ) {
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
}

function cellAtPosition( pos ) {
    console.log( "x " + pos.x + " y " + pos.y );
    var x = (pos.x - boardOffset.x) / cellsize;
    var y = (pos.y - boardOffset.y) / cellsize;
    if( x < 0 || y < 0 || x >= boardColumns || y >= boardRows ) {
	return null;
    }
    return { col: Math.floor( x ),
	     row: Math.floor( y ) };
}

function getClickPosition( e ) {
    return {
	x: e.pageX - jqcanvas.offset().left,
	y: e.pageY - jqcanvas.offset().top
    };
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

function toggleElementAt( cell ) {
    var element = elementAt( cell.col, cell.row );
    if( element ) {
	removeElement( element );
    }

    var newElement = null;

    if( !element ) {
	newElement = flipper( cell.col, cell.row, true );
    } else if( element.type == "flipper" && element.ascending ) {
	newElement = flipper( coll.col, cell.row, false );
    }

    if( newElement ) {
	elements.push( newElement );
    }
}

function handleClick( pos ) {
    var cell = cellAtPosition( pos );
    if( !cell ) {
	return;
    }

    toggleElementAt( cell );
}

function begin() {
    canvas = document.getElementById( "flippersCanvas" );
    ctx = canvas.getContext( "2d" );
    jqcanvas = $("#flippersCanvas");

    jqcanvas.on( "click", function(e) {
	e.preventDefault();
	handleClick( getClickPosition( e ) );
    });

    setInterval( drawFrame, 1000.0 / 30.0 );
    setInterval( advanceWorld, 15.0 );
}

function stepWorld() {
    if( gamestate.resolve ) {
	gamestate.resolve();
    }
    gamestate = nextState( gamestate );
}

function advanceWorld() {
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
    
    for(var i in elements) {
        var x = elements[i];
        drawFlipper( x.col, x.row, x.ascending );
    }

    var pos = ballPosition();
    drawBall( pos.x, pos.y );
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

function drawFlipper( col, row, type ) {
    var xleft = col * cellsize + boardOffset.x;
    var xright = (col+1) * cellsize + boardOffset.x;
    var ytop = row * cellsize + boardOffset.y;
    var ybottom = (row+1) * cellsize + boardOffset.y;
    ctx.strokeStyle = "#f00";
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
