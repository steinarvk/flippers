var buster = require("buster");

var BoardFitter = require("../src/BoardFitter");

buster.testCase( "BoardFitter", {
    "basic": function() {
        var area = {x: 0, y: 0, width: 200, height: 100},
            sz = { cols: 10, rows: 8 },
            bf = BoardFitter.create( area, sz );
        buster.assert( typeof bf.cellsize() === "number" );
        buster.assert( typeof bf.offset().x === "number" );
        buster.assert( typeof bf.offset().y === "number" );
        buster.refute.greater( bf.offset().x + 
                               bf.cellsize() * sz.cols, area.width );
        buster.refute.greater( bf.offset().y + 
                               bf.cellsize() * sz.rows, area.height );
    },
    "cell centers": function() {
        var area = {x: 0, y: 0, width: 100, height: 100},
            sz = { cols: 10, rows: 10 },
            bf = BoardFitter.create( area, sz ),
            col, row, cell;
        for(col = 0; col < 10; col++) {
            for(row = 0; row < 10; row++) {
                cell = bf.cellAtPosition( bf.cellCenter({col: col, row: row}) );
                buster.refute.equals( cell, null );
                buster.assert.equals( cell.col, col );
                buster.assert.equals( cell.row, row );
            }
        }
    },
    "cell rects": function() {
        var area = {x: 9, y: 15, width: 123, height: 145},
            sz = { cols: 13, rows: 11 },
            bf = BoardFitter.create( area, sz ),
            col, row, rect;
        for(col = 0; col < sz.cols; col++) {
            for(row = 0; row < sz.rows; row++) {
                rect = bf.cellRect( {col: col, row: row} );

                buster.refute.equals( rect, null );
                buster.assert.equals( rect.width, bf.cellsize() );
                buster.assert.equals( rect.height, bf.cellsize() );

                buster.assert.near( rect.x + 0.5 * bf.cellsize(),
                                    bf.cellCenter( {col: col, row: row} ).x,
                                    1 );

                buster.assert.near( rect.y + 0.5 * bf.cellsize(),
                                    bf.cellCenter( {col: col, row: row} ).y,
                                    1 );
            }
        }
    },
    "cellPosition": function() {
        var area = {x: 0, y: 0, width: 100, height: 100},
            sz = { cols: 10, rows: 10 },
            bf = BoardFitter.create( area, sz );

        buster.assert.equals( bf.cellAtPosition( bf.offset() ),
                              {col: 0, row: 0} );
        buster.assert.equals( bf.cellAtPosition( {x: bf.offset().x - 1,
                                                  y: bf.offset().y + 1}),
                              null );
        buster.assert.equals( bf.cellAtPosition( {x:
                                                  bf.offset().x
                                                  + bf.cellsize() * 10 - 1,
                                                  y:
                                                  bf.offset().y
                                                  + bf.cellsize() * 10 - 1} ),
                              {col: 9, row: 9} );
        buster.assert.equals( bf.cellAtPosition( {x:
                                                  bf.offset().x
                                                  + bf.cellsize() * 10 - 1,
                                                  y:
                                                  bf.offset().y + 1 } ),
                              {col: 9, row: 0} );
    }
} );











