"use strict";

var Generator = require("./Generator");
var Util = require("./Util");
var GameState = require( "./GameState" );
var Random = require("./Random");

var StateGen = {create: function(size) {
    function allDenseFlippers() {
        var gen = Generator.cartesianPower( [false,true],
                                            size.cols * size.rows );

        gen = Generator.map(
            gen,
            createFlippersFromValues
        );

        return gen;
    }

    function createFlippersFromValues(values) {
        var rv = GameState.create(size);
        rv.onAllCells( function(cell) {
            var index = cell.row * size.cols + cell.col;
            if( values[index] !== null ) {
                rv.setElement(
                    Util.merge( cell,
                                {type: "flipper",
                                 ascending: values[index]} ) );
            }
        } );
        return rv.save();
    }

    function randomBlanksOrFlippers() {
        var xs = [], i;
        for(i = 0; i < (size.cols * size.rows); i++) {
            xs.push( [false,true,null] );
        }
        return Generator.map( function() { return Random.choices(xs); },
                              createFlippersFromValues );
    }

    function allBlanksOrFlippers() {
        var gen = Generator.cartesianPower( [false,true,null],
                                            size.cols * size.rows );

        gen = Generator.map( gen,
                             createFlippersFromValues );

        return gen;
    }
    
    return {
        allDenseFlippers: allDenseFlippers,
        allBlanksOrFlippers: allBlanksOrFlippers,
        randomBlanksOrFlippers: randomBlanksOrFlippers
    };
} };

module.exports = StateGen;
