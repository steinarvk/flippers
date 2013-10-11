var AABB = require("./AABB");

module.exports = { create: function(canvas, area, boardsize) {
    var ctx = canvas.getContext( "2d" );

    var cellsize = null;
    var offset = null;

    var boardShading = null;

    function drawBoard() {
	for(var i = 0; i < boardsize.cols; i++) {
            for(var j = 0; j < boardsize.rows; j++) {
		var isWhite = (i%2) == (j%2);
                var shaded = boardShading && boardShading.get(i,j);

		if( shaded ) {
                    ctx.fillStyle = isWhite ? "#a88" : "#88a";
                } else {
                    ctx.fillStyle = isWhite ? "#caa" : "#aac";
                }

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

    function setBoardShading( shading ) {
        boardShading = shading;
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

    autofitBoard();

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

    function cellRect( cell ) {
        return {x: cell.col * cellsize + offset.x,
                y: cell.row * cellsize + offset.y,
                width: cellsize,
                height: cellsize};
    }
    
    function rectCenter( rect ) {
        return {x: rect.x + 0.5 * rect.width,
                y: rect.y + 0.5 * rect.height};
    }

    function rectRadius( rect ) {
        return Math.min( 0.5 * rect.width, 0.5 * rect.height );
    }

    function colourOf( base, deactivated ) {
        if( base == "red" ) {
            if( !deactivated ) {
	        return "#e32";
            }
            return "#932";
        }

        if( base == "green" ) {
            if( !deactivated ) {
                return "#1b1";
            }
            return "#151";
        }

        return "#111";
    }

    function drawFlippingFlipper( thing, degrees, rect ) {
        rect = rect || cellRect( thing );
	var c = rectCenter( rect );
	var r = rectRadius( rect );

	var a = 2 * Math.PI * degrees / 360.0;
	var cosa = Math.cos( a );
	var sina = Math.sin( a );
	
	ctx.strokeStyle = colourOf( thing.colour, thing.deactivated );
	ctx.beginPath();
	ctx.moveTo( c.x - r * cosa, c.y - r * sina );
	ctx.lineTo( c.x + r * cosa, c.y + r * sina );
	ctx.stroke();
    }

    function drawFlipper( thing, options, rect ) {
	drawFlippingFlipper( thing, thing.ascending ? -45 : 45, rect );
    }
    
    function drawSquare( thing, options, rect ) {
        rect = rect || cellRect( thing );

	var size = 1.0;
	var sp = 3;

	ctx.strokeStyle = colourOf( thing.colour, thing.deactivated );

	if( options && options.disappear && options.disappear.phase ) {
	    size = 1.0 - 0.8 * options.disappear.phase;
	}

	var c = rectCenter( rect );

	for(var i = 0; i < 5; i++) {
	    var r = rectRadius( rect ) * size * (0.6 + i * 0.1);
	    ctx.strokeRect( c.x - r,
			    c.y - r,
			    2 * r,
			    2 * r );
	}
    }
    
    function drawTriangle( thing, options, rect  ) {
        rect = rect || cellRect( thing );

	ctx.strokeStyle = colourOf( thing.colour, thing.deactivated );
	var sp = 3;
	var dx = [-1,1,1,-1];
	var dy = [1,1,-1,-1];
        var c = rectCenter( rect );
	
	for(var i = 0; i < 5; i++) {
	    var begun = false;
	    var f = ctx.moveTo;
	    var x0, y0;
	    ctx.beginPath();
	    for(var j = 0; j < 4; j++) {
		if( j == thing.rotation ) continue;
		var x = c.x + dx[j] * (rectRadius( rect ) - sp * i);
		var y = c.y + dy[j] * (rectRadius( rect ) - sp * i);
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
    
    function drawBreakableTriangle( thing, options, rect ) {
        rect = rect || cellRect( thing );

	ctx.strokeStyle = colourOf( thing.colour, thing.deactivated );
	var sp = 9;
	var size = 1;
	var dx = [-1,1,1,-1];
	var dy = [1,1,-1,-1];
        var c = rectCenter( rect );

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
		var x = c.x + dx[j] * (rectRadius( rect ) * size * (0.75 + 0.25 * i));
		var y = c.y + dy[j] * (rectRadius( rect ) * size * (0.75 + 0.25 * i));
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
    
    function drawBreakableSquare( thing, options, rect ) {
        rect = rect || cellRect( thing );

	var size = 1.0;

	ctx.strokeStyle = colourOf( thing.colour, thing.deactivated );

	if( options && options.disappear && options.disappear.phase ) {
	    size = 1.0 - 0.8 * options.disappear.phase;
	}

        var c = rectCenter( rect );

	for(var i = 0; i < 2; i++) {
	    var r = rectRadius( rect ) * size * (0.75 + i * 0.25);
	    ctx.strokeRect( c.x - r,
			    c.y - r,
			    2 * r,
			    2 * r );
	}
    }
    
    function drawSwitch( thing, options, rect ) {
        rect = rect || cellRect( thing );

	ctx.fillStyle = colourOf( thing.colour, thing.deactivated );
	ctx.beginPath();
	ctx.arc( rectCenter( rect ).x,
                 rectCenter( rect ).y,
		 rectRadius( rect ),
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

    function drawElementInRect( thing, rect ) {
        drawFunctions[thing.type]( thing, null, rect );
    }

    function drawInventoryItemIn( item, options, rect ) {
        drawColouredRect( rect, options.selected ? "yellow" : "#ddd" );
        drawElementInRect( item, rect );
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
        if( t <= x0 ) return 0.0;
        if( t >= x1 ) return 1.0;
	return (t - x0) / (x1 - x0);
    }

    function drawFlippingEvent( event, t ) {
	t = linearClipAndScale( t, 0.4, 1.0 );
	if( t <= 0 ) {
	    drawFlipper( {col: event.element.col,
                          colour: event.element.colour,
			  row: event.element.row,
			  ascending: event.originallyAscending } );
	} else if( t >= 1 ) {
	    drawFlipper( {col: event.element.col,
                          colour: event.element.colour,
			  row: event.element.row,
			  ascending: !event.originallyAscending } );
	} else {
	    var a0 = event.originallyAscending ? -45 : 45;
	    var d = event.ccw ? -90 : 90;
	    drawFlippingFlipper( event.element, a0 + t * d );
	}
	return true;
    }

    function drawDisappearingEvent( event, t ) {
	var renderer = drawFunctions[ event.element.type ];
        var end = event.begin + 0.5;
        if( t >= end ) {
            return true;
        }
        t = linearClipAndScale( t, event.begin, end );
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

    function drawColouredRect( rect, colour ) {
        var col = colour || "#0f0";
	ctx.fillStyle = col;
        var r = rect;
	ctx.fillRect( r.x,
                      r.y,
                      r.width,
                      r.height );
    }
        
    return {
	setBoardSize: setBoardSize,
        setBoardShading: setBoardShading,
	drawBackground: drawBoard,
	drawElement: drawElement,
	drawElementIn: drawElementInRect,
	drawInventoryItemIn: drawInventoryItemIn,
	drawEvent: drawEvent,
	drawBall: drawBall,
	cellAtPosition: cellAtPosition,
        drawColouredAABB: drawColouredAABB
    };
} };
