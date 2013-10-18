/*jslint browser: true*/
/*globals $*/

"use strict";

var AABB = require("./AABB");
var BoardFitter = require("./BoardFitter");

module.exports = { create: function(canvas, area, boardsize) {
    var ctx = canvas.getContext( "2d" ),
        cellsize = null,
        offset = null,
        boardShading = null;

    function drawBoard() {
        var i, j,
            isWhite, shaded;

	for(i = 0; i < boardsize.cols; i++) {
            for(j = 0; j < boardsize.rows; j++) {
		isWhite = (i%2) === (j%2);
                shaded = boardShading && boardShading.get(i,j);

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
    
    function autofitBoard() {
        var rv = BoardFitter.create( area, boardsize );
        cellsize = rv.cellsize();
        offset = rv.offset();
    }

    function setBoardSize( sz ) {
	if( sz.cols === boardsize.cols && sz.rows === boardsize.rows ) {
	    return;
	}
	boardsize = sz;
	autofitBoard();
    }

    function setBoardShading( shading ) {
        boardShading = shading;
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
        if( base === "red" ) {
            if( !deactivated ) {
	        return "#e32";
            }
            return "#932";
        }

        if( base === "green" ) {
            if( !deactivated ) {
                return "#1b1";
            }
            return "#151";
        }

        return "#111";
    }

    function drawFlippingFlipper( thing, degrees, rect ) {
        rect = rect || cellRect( thing );
	var c = rectCenter( rect ),
            r = rectRadius( rect ),
            a = 2 * Math.PI * degrees / 360.0,
	    cosa = Math.cos( a ),
	    sina = Math.sin( a );
	
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

	var size = 1.0,
	    c = rectCenter( rect ),
            i,
            r;

	ctx.strokeStyle = colourOf( thing.colour, thing.deactivated );

	if( options && options.disappear && options.disappear.phase ) {
	    size = 1.0 - 0.8 * options.disappear.phase;
	}


	for(i = 0; i < 5; i++) {
	    r = rectRadius( rect ) * size * (0.6 + i * 0.1);
	    ctx.strokeRect( c.x - r,
			    c.y - r,
			    2 * r,
			    2 * r );
	}
    }

    function drawDirectionUpArrow( cell ) {
        // For now it's always up, so let's simplify this as far as it goes.
        // We'll be switching to image-based graphics soon enough anyway.
        ctx.strokeStyle = "#5a5";
        ctx.fillStyle = "#0a0";

        var rect = cellRect( cell ),
            c = rectCenter( rect ),
            r = rectRadius( rect ) * 0.75,
            begun = false,
            x0,
            y0,
            i, a, x, y;

        ctx.beginPath();


        for(i = 0; i < 3; i++) {
            a = -Math.PI * 0.5 + i * (2/3 * Math.PI);
            x = c.x + r * Math.cos( a );
            y = c.y + r * Math.sin( a );

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

        ctx.fill();
    }

    function drawOriginAndExit( origin, exit ) {
        drawDirectionUpArrow( origin );
        drawDirectionUpArrow( exit );
    }
    
    function drawTriangle( thing, options, rect  ) {
        rect = rect || cellRect( thing );

	ctx.strokeStyle = colourOf( thing.colour, thing.deactivated );
	var sp = 3,
	    dx = [-1,1,1,-1],
	    dy = [1,1,-1,-1],
            c = rectCenter( rect ),
            begun = false,
            i, j,
            x0, y0,
            x, y;
	
	for(i = 0; i < 5; i++) {
	    ctx.beginPath();
	    for(j = 0; j < 4; j++) {
		if( j === thing.rotation ) {
                    continue;
                }
		x = c.x + dx[j] * (rectRadius( rect ) - sp * i);
		y = c.y + dy[j] * (rectRadius( rect ) - sp * i);
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
	var size = 1,
	    dx = [-1,1,1,-1],
	    dy = [1,1,-1,-1],
            c = rectCenter( rect ),
            begun = false,
            i, j, x0, y0, x, y;

	if( options && options.disappear && options.disappear.phase ) {
	    size = 1.0 - 0.8 * options.disappear.phase;
	}
	
	for(i = 0; i < 2; i++) {
	    ctx.beginPath();
	    for(j = 0; j < 4; j++) {
		if( j === thing.rotation ) {
                    continue;
                }
		x = c.x + dx[j] * (rectRadius( rect ) * size * (0.75 + 0.25 * i));
		y = c.y + dy[j] * (rectRadius( rect ) * size * (0.75 + 0.25 * i));
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

	var size = 1.0,
            c = rectCenter( rect ),
            i, r;

	ctx.strokeStyle = colourOf( thing.colour, thing.deactivated );

	if( options && options.disappear && options.disappear.phase ) {
	    size = 1.0 - 0.8 * options.disappear.phase;
	}

	for(i = 0; i < 2; i++) {
	    r = rectRadius( rect ) * size * (0.75 + i * 0.25);
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

    function drawFunction(name) {
        return {
	    "flipper": drawFlipper,
	    "square": drawSquare,
	    "breakable-square": drawBreakableSquare,
	    "switch": drawSwitch,
	    "breakable-triangle": drawBreakableTriangle,
	    "triangle": drawTriangle
        }[name];
    }

    function drawElement( thing ) {
	drawFunction(thing.type)( thing );
    }

    function drawElementInRect( thing, rect ) {
        drawFunction(thing.type)( thing, null, rect );
    }

    function cellAtPosition( pos ) {
        return BoardFitter.create( area, boardsize ).cellAtPosition( pos );
    }
    
    function linearClipAndScale( t, x0, x1 ) {
        if( t <= x0 ) {
            return 0.0;
        }
        if( t >= x1 ) {
            return 1.0;
        }
	return (t - x0) / (x1 - x0);
    }

    function drawFlippingEvent( event, t ) {
        var a0, d;

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
	    a0 = event.originallyAscending ? -45 : 45;
	    d = event.ccw ? -90 : 90;

	    drawFlippingFlipper( event.element, a0 + t * d );
	}
	return true;
    }

    function drawDisappearingEvent( event, t ) {
	var renderer = drawFunction( event.element.type ),
            end = event.begin + 0.5;
        if( t >= end ) {
            return true;
        }
        t = linearClipAndScale( t, event.begin, end );
	renderer( event.element,
		  {disappear: {phase: t}} );
	return true;
    }

    function drawEventFunction(name) {
	return {"disappear": drawDisappearingEvent,
	        "flip": drawFlippingEvent
               }[name];
    }

    function drawEvent( event, t ) {
	var f = drawEventFunction( event.type );
	if( !f ) {
	    return false;
	}
	return f( event, t );
    }
    
    setBoardSize( boardsize );

    function drawColouredAABB( bb, colour ) {
        var col = colour || "#0f0",
            r = bb.rect();

	ctx.fillStyle = col;
	ctx.fillRect( r.x,
                      r.y,
                      r.width,
                      r.height );
    }

    function drawColouredRect( rect, colour ) {
        var col = colour || "#0f0";
	ctx.fillStyle = col;
	ctx.fillRect( rect.x,
                      rect.y,
                      rect.width,
                      rect.height );
    }

    function drawInventoryItemIn( item, options, rect ) {
        drawColouredRect( rect, options.selected ? "yellow" : "#ddd" );
        drawElementInRect( item, rect );
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
        drawGoals: drawOriginAndExit,
	cellAtPosition: cellAtPosition,
        drawColouredAABB: drawColouredAABB
    };
} };
