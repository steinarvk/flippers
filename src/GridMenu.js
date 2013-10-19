"use strict";

var Regions = require("./Regions");
var AABB = require("./AABB");
var Util = require("./Util");

var Menu = {create: function(canvas, area, grid, items, mouse, options) {
    var ctx = canvas.getContext("2d"),
        regions = Regions.create(),
        fontStyle = null;

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
        var padding = 0.1,
            cellWidth,
            cellHeight,
            effWidth,
            effHeight,
            interiorHeight,
            pad, index, i, j, region;

        if( options && options.padding !== undefined ) {
            padding = options.padding;
        }


        cellWidth = Math.floor( area.width / grid.cols );
        cellHeight = Math.floor( area.height / grid.rows );

        effWidth = Math.floor( (1.0 - padding) * cellWidth );
        effHeight = Math.floor( (1.0 - padding) * cellHeight );

        if( options && options.square ) {
            cellWidth = cellHeight = Math.min( cellWidth, cellHeight );
            effWidth = effHeight = Math.min( effWidth, effHeight );
        }

        interiorHeight = effHeight * (1.0 - padding);

        pad = {x: padding * 0.5 * cellWidth,
               y: padding * 0.5 * cellHeight};
        
        fontStyle = "bold " + interiorHeight + "px sans-serif";

        index = 0;
        for(j = 0; j < grid.rows; j++) {
            for(i = 0; i < grid.cols; i++) {
                if( !items[index] ) {
                    return;
                }

                region = AABB.create( {x: area.x + i * cellWidth + pad.x,
                                       y: area.y + j * cellHeight + pad.y,
                                       width: effWidth,
                                       height: effHeight} );
                
                regions.add( Util.merge( region, {item: items[index]} ) );

                ++index;
            }
        }
    }());

    function draw() {
        regions.onRegions( function(region) {
            var r = region;
            
            if( regionIsActive( r ) ) {
                ctx.fillStyle = "#ccf";
            } else {
                ctx.fillStyle = "#99c";
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
        mouseHandler: mouseHandler,
        back: (options && options.back)
    };
} };

module.exports = Menu;
