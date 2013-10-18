var BoardFitter = require("./BoardFitter");
var Util = require("./Util");

var ImageGraphics = { create: function(canvas, images, area, boardsize) {
    var ctx = canvas.getContext( "2d" );
    var fitter = BoardFitter.create( area, boardsize );
    var shading = null;

    function setBoardSize( sz ) {
        boardsize = sz;
        fitter = BoardFitter.create( area, boardsize );
    }

    function setBoardShading( shade ) {
        shading = shade;
    }

    function cellAtPosition( pos ) {
        return fitter.cellAtPosition( pos );
    }

    function noOp() {
        return null;
    }

    function drawElement( thing ) {
        drawElementInRect( thing, fitter.cellRect( thing ) );
    }

    function colourOf( thing ) {
        var blessedColours = {
            red: "red",
            green: "green",
            black: "black"
        };
        if( blessedColours[ thing.colour ] ) {
            return blessedColours[ thing.colour ];
        }
        return "black";
    }

    function drawImageInRect( name, rect, rotation, scaling ) {
        var src = images[name];
        
        if( !src ) {
            console.log( "not found: " + name );
            return;
        }
        if( rotation || scaling ) {
            ctx.save();
            ctx.translate( rect.x + rect.width * 0.5,
                           rect.y + rect.height * 0.5 );
            ctx.rotate( rotation );

            ctx.drawImage( src,
                           - 0.5 * rect.width,
                           - 0.5 * rect.height,
                           rect.width,
                           rect.height );

            ctx.restore();
        } else {
            ctx.drawImage( src,
                           rect.x,
                           rect.y,
                           rect.width,
                           rect.height );
        }
    }

    function drawFlipperInRect( thing, rect, rotation ) {
        var name = "block_flipper_"
                + colourOf(thing)
                + (thing.deactivated ? "_disabled" : "");
        if( !rotation ) {
            if( thing.ascending ) {
                drawImageInRect( name, rect );
            } else {
                drawImageInRect( name, rect, Math.PI * 0.5 );
            }
        } else {
            drawImageInRect( name, rect, rotation );
        }
    };

    function drawSwitchInRect( thing, rect ) {
        var name = "block_switch_"
                + colourOf(thing);
        drawImageInRect( name, rect );
    };

    function drawSquareInRect( thing, rect ) {
        var name = "block_square_"
                + colourOf(thing) 
                + "_"
                + ((thing.type == "breakable-square") ? "hollow" : "solid")
                + (thing.deactivated ? "_disabled" : "");
        drawImageInRect( name, rect );
    };

    function drawTriangleInRect( thing, rect ) {
        var name = "block_tri_"
                + colourOf(thing) 
                + "_"
                + ((thing.type == "breakable-triangle") ? "hollow" : "solid")
                + (thing.deactivated ? "_disabled" : "");
        var rot = -(thing.rotation - 1) * Math.PI * 0.5;
        drawImageInRect( name, rect, rot );
    };

    function linearClipAndScale( t, x0, x1 ) {
        if( t <= x0 ) return 0.0;
        if( t >= x1 ) return 1.0;
	return (t - x0) / (x1 - x0);
    }

    function scaleRect( rect, x ) {
        return {x: rect.x + rect.width * 0.5 * (1-x),
                y: rect.y + rect.height * 0.5 * (1-x),
                width: rect.width * x,
                height: rect.height * x };
    }

    function drawDisappearingEvent( event, t ) {
        var end = event.begin + 0.5;
        if( t >= end ) {
            return true;
        }
        t = linearClipAndScale( t, event.begin, end );
        drawElementInRect( event.element,
                           scaleRect( fitter.cellRect( event.element ),
                                      1 - t ) );
        return true;
    }

    function drawFlippingEvent( event, t ) {
        t = linearClipAndScale( t, 0.4, 1.0 );
        var rect = fitter.cellRect( event.element );
        if( t <= 0 ) {
            drawFlipperInRect( {colour: event.element.colour,
                                ascending: event.originallyAscending},
                               rect );
        } else if( t >= 1 ) {
            drawFlipperInRect( {colour: event.element.colour,
                                ascending: !event.originallyAscending},
                               rect );
        } else {
	    var a0 = event.originallyAscending ? 0 : 90;
	    var d = event.ccw ? -90 : 90;
            
            console.log( "d raw " + (a0 + t * d) );

            drawFlipperInRect( event.element,
                               rect,
                               2 * Math.PI * (a0 + t * d) / 360 );
        }
        return true;
    }

    var drawEventFunctions = {
        "flip": drawFlippingEvent,
        "disappear": drawDisappearingEvent
    };

    function drawEvent( event, t ) {
        var f = drawEventFunctions[ event.type ];
        if( !f ) {
            return false;
        }
        return f( event, t );
    }

    var drawElementFunctions = {
        "flipper": drawFlipperInRect,
        "square": drawSquareInRect,
        "breakable-square": drawSquareInRect,
        "switch": drawSwitchInRect,
        "breakable-triangle": drawTriangleInRect,
        "triangle": drawTriangleInRect
    };

    function drawElementInRect( thing, rect ) {
        var f = drawElementFunctions[ thing.type ];
        if( f ) {
            f( thing, rect );
        } else {
            console.log( "unable to draw: " + JSON.stringify( thing ) );
        }       
    }

    function drawInventoryItemIn( item, options, rect ) {
        drawElementInRect( item, rect );

        // Draw indication using options.selected
        if( options.selected ) {
	    ctx.fillStyle = "rgba(255,255,0,0.5)";

            ctx.fillRect( rect.x,
                          rect.y,
                          rect.width,
                          rect.height );
        }
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

    function drawBall( pos ) {
        // TODO this is old-style diagram graphics
        var offset = fitter.offset();
        var cellsize = fitter.cellsize();

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

    function drawBoard() {
        // TODO this is old-style diagram graphics
        var offset = fitter.offset();
        var cellsize = fitter.cellsize();

	for(var i = 0; i < boardsize.cols; i++) {
            for(var j = 0; j < boardsize.rows; j++) {
		var isWhite = (i%2) == (j%2);
                var shaded = shading && shading.get(i,j);

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

    function drawDirectionUpArrow( cell ) {
        // For now it's always up, so let's simplify this as far as it goes.
        // We'll be switching to image-based graphics soon enough anyway.
        ctx.strokeStyle = "#5a5";
        ctx.fillStyle = "#0a0";

        var rect = fitter.cellRect( cell );
        var c = Util.rectCenter( rect );
        var r = Util.rectInnerRadius( rect ) * 0.75;

        ctx.beginPath();

        var begun = false;
        var x0, y0;

        for(var i = 0; i < 3; i++) {
            var a = -Math.PI * 0.5 + i * (2/3 * Math.PI);
            var x = c.x + r * Math.cos( a );
            var y = c.y + r * Math.sin( a );

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
        drawColouredAABB: noOp
    };
} };

module.exports = ImageGraphics;
