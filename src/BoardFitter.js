"use strict";

var BoardFitter = {create: function(area, boardsize) {
    var padding = 0,
        pad_cols = 1,
        pad_rows = 1,
        cellsize = Math.ceil(
            (Math.min( (area.width - 2 * padding) / (boardsize.cols + 2 * pad_cols),
                       (area.height - 2 * padding) / (boardsize.rows + 2 * pad_rows) ) / 2)
        ) * 2,
        offset = {
            x: area.x + (area.width - (boardsize.cols) * cellsize) * 0.5,
            y: area.y + (area.height - (boardsize.rows)* cellsize) * 0.5
        };

    function cellAtPosition( pos ) {
        var x = Math.floor( (pos.x - offset.x) / cellsize ),
            y = Math.floor( (pos.y - offset.y) / cellsize );
        if( x < 0
            || y < 0
            || x >= boardsize.cols
            || y >= boardsize.rows ) {
            return null;
        }
        return {col: x,
                row: y};
    }

    function cellCenter( cell ) {
        return {x: (cell.col + 0.5) * cellsize + offset.x,
                y: (cell.row + 0.5) * cellsize + offset.y};
    }

    function cellRect( cell ) {
        return {x: cell.col * cellsize + offset.x,
                y: cell.row * cellsize + offset.y,
                width: cellsize,
                height: cellsize};
    }
    
    return {
        cellAtPosition: cellAtPosition,
        cellsize: function() { return cellsize; },
        offset: function() { return offset; },
        cellCenter: cellCenter,
        cellRect: cellRect
    };
} };

module.exports = BoardFitter;
