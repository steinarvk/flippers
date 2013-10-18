"use strict";

var AABB = require("./AABB");

/*globals $*/

module.exports = {create: function( area, size, options ) {
    var margins = options.margins || 0,
        cellsize = Math.min(
            Math.floor( area.width / (2 * size.cols) ) * 2,
            Math.floor( area.height / (2 * size.rows) ) * 2
        ),
        padding = {
            x: 0.5 * (area.width - cellsize * size.cols),
            y: 0.5 * (area.height - cellsize * size.rows)
        };

    function createCell( cell, data ) {
        var rv = AABB.create( {x: area.x + padding.x + cellsize * cell.col + margins,
                               y: area.y + padding.y + cellsize * cell.row + margins,
                               width: cellsize - 2 * margins,
                               height: cellsize - 2 * margins} );
        if( data ) {
            $.extend( rv, data );
        }
        return rv;
    }

    return {
        cell: createCell
    };
} };
