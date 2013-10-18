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
    }
} );
