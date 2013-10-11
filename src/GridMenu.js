var Regions = require("./Regions");
var AABB = require("./AABB");

var Menu = {create: function(canvas, area, grid, items, mouse, options) {
    var ctx = canvas.getContext("2d");
    var regions = Regions.create();
    var fontStyle = null;
    var fontWidth = null;

    function regionIsActive( region ) {
        if( !mouse ) {
            return false;
        }

        var p = mouse.lastPosition();

        if( !p ) {
            return false;
        }

        return region.contains( p );
    }

    (function() {
        var padding = 0.1;

        if( options && options.padding !== undefined ) {
            padding = options.padding;
        }

        var cellWidth = Math.floor( area.width / grid.cols );
        var cellHeight = Math.floor( area.height / grid.rows );

        var effWidth = Math.floor( (1.0 - padding) * cellWidth );
        var effHeight = Math.floor( (1.0 - padding) * cellHeight );

        if( options && options.square ) {
            cellWidth = cellHeight = Math.min( cellWidth, cellHeight );
            effWidth = effHeight = Math.min( effWidth, effHeight );
        }

        var interiorHeight = effHeight * (1.0 - padding);
        var interiorWidth = effWidth * (1.0 - padding);

        var pad = {x: padding * 0.5 * cellWidth,
                   y: padding * 0.5 * cellHeight};

        fontStyle = "bold " + interiorHeight + "px sans-serif";

        var index = 0;
        for(var j = 0; j < grid.rows; j++) {
            for(var i = 0; i < grid.cols; i++) {
                if( !items[index] ) {
                    return;
                }

                var region = AABB.create( {x: area.x + i * cellWidth + pad.x,
                                           y: area.y + j * cellHeight + pad.y,
                                           width: effWidth,
                                           height: effHeight} );

                regions.add( $.extend( region, {item: items[index]} ) );

                ++index;
            }
        }
    })();

    function draw() {
        regions.onRegions( function(region) {
            var r = region;
            
            if( regionIsActive( r ) ) {
                ctx.fillStyle = "yellow";
            } else {
                ctx.fillStyle = "blue";
            }
            ctx.fillRect( r.x, r.y, r.width, r.height );

            ctx.fillStyle = "black";

            ctx.font = fontStyle;
            ctx.textBaseline = "top";
            ctx.textAlign = "center";
            ctx.fillText( region.item.text,
                          r.x + r.width * 0.5,
                          r.y );
        } );
    }

    function mouseHandler(p) {
        var region = regions.at( {x: p.x - area.x,
                                  y: p.y - area.y} );
        if( !region ) {
            return null;
        }
        
        return {
            tap: function() {
                region.item.activate();
            }
        };
    }

    return {
        draw: draw,
        mouseHandler: mouseHandler
    };
} };

module.exports = Menu;
