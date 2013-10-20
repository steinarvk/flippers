var couchapp = require("couchapp");
var path = require("path");

var DesignDoc = {
    _id: "_design/flippers",
    views: {},
    lists: {},
    shows: {}
};

module.exports = DesignDoc;

DesignDoc.views.puzzlesByName = {
    map: function(doc) {
        if( doc.type == "puzzle" ) {
            emit( doc.name,
                  {author: doc.author,
		   size: doc.puzzle.size,
		   inventory: doc.puzzle.inventory.length} );
        }
    }
};

DesignDoc.views.puzzlesById = {
    map: function(doc) {
        if( doc.type == "puzzle" ) {
            emit( doc._id, doc );
        }
    }
};

DesignDoc.validate_doc_update = function(newDoc, oldDoc, userCtx) {
    var validatePuzzleDocument = function( doc ) {
        if( typeof doc.name !== 'string' ) {
            throw( {forbidden: "puzzle with missing or invalid field 'name'"} );
        }
        if( typeof doc.author !== 'string' ) {
            throw( {forbidden: "puzzle with missing or invalid field 'author'"} );
        }
        if( typeof doc.puzzle !== 'object' ) {
            throw( {forbidden: "puzzle with missing or invalid field 'puzzle'"} );
        }
        if( doc.puzzle.inventory.length < 1 ) {
            throw( {forbidden: "puzzle inventory invalid"} );
        }
        if( doc.puzzle.elements.length < 1 ) {
            throw( {forbidden: "puzzle elements invalid" } );
        }
        if( typeof doc.puzzle.size.cols !== "number" || typeof doc.puzzle.size.rows !== "number" ) {
            throw( {forbidden: "puzzle size invalid"} );
        }
    };

    if( newDoc._deleted ) {
        return;
    }

    if( newDoc.type == "puzzle" ) {
        validatePuzzleDocument( newDoc );
    } else {
        throw( {forbidden: "document without type"} );
    }
};
