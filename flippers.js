var canvas = null;
var ctx = null;
var cellsize = 50.0;

var flippers = [
    { col: 0, row: 0, ascending: false },
    { col: 1, row: 3, ascending: true },
    { col: 3, row: 1, ascending: false }
];

var gamestate = {
    col: 0,
    row: 0,
    phase: 0.0,
    d1: {x: 0, y: 1},
    d2: {x: 1, y: 0}
};

function begin() {
    canvas = document.getElementById( "flippersCanvas" );
    ctx = canvas.getContext( "2d" );

    setInterval( drawFrame, 1000.0 / 30.0 );
    setInterval( advanceWorld, 15.0 );
}

function stepWorld() {
    var d = gamestate.d2;
    gamestate.col += d.x;
    gamestate.row += d.y;
    gamestate.d1 = d;
    gamestate.d2 = d;
}

function advanceWorld() {
    gamestate.phase += 0.02;
    while( gamestate.phase > 1.0 ) {
        stepWorld();
        gamestate.phase -= 1.0;
    }
}

function scaleToCellsize(p) {
    return {x: p.x * cellsize, y: p.y * cellsize};
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

    drawChessboard( 9, 9, cellsize );
    
    for(var i in flippers) {
        var x = flippers[i];
        drawFlipper( x.col, x.row, x.ascending );
    }

    var pos = ballPosition();
    drawBall( pos.x, pos.y );
}

function drawBall( cx, cy ) {
    ctx.fillStyle = "#000";
    ctx.fillRect( cx - 5, cy - 5, 10, 10 );
}

function drawFlipper( col, row, type ) {
    var xleft = col * cellsize;
    var xright = (col+1) * cellsize;
    var ytop = row * cellsize;
    var ybottom = (row+1) * cellsize;
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

function drawChessboard( cols, rows, sidesz ) {
    for(var i = 0; i < cols; i++) {
        for(var j = 0; j < rows; j++) {
            var isWhite = (i%2) == (j%2);
            ctx.fillStyle = isWhite ? "#caa" : "#aac";
            ctx.fillRect( i * sidesz, j * sidesz, sidesz, sidesz );
        }
    }
}

window.onload = begin;
