"use strict";

var PieceUtil = (function() {
    function normalizePiece( piece ) {
        piece = JSON.parse( JSON.stringify( piece ) );

        delete piece.col;
        delete piece.row;
        if( piece.ascending ) {
            piece.ascending = false;
        }
        if( piece.rotation ) {
            piece.rotation = 0;
        }
        return piece;
    }


    return {
        normalizePiece: normalizePiece
    };
}());

module.exports = PieceUtil;
