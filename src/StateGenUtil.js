"use strict";

var StateGen = require("./StateGen");
var StateFilter = require("./StateFilter");
var Solver = require("./Solver");
var Generator = require("./Generator");


var StateGenUtil = (function() {
    function generateDenseFlippers( size ) {
        return Generator.filters( StateGen.create(size).allDenseFlippers(),
                                  [StateFilter.successful(),
                                   StateFilter.nontrivial()] );
    }

    function generateBlanksOrFlippers( size, random ) {
        var fname = random ? "randomBlanksOrFlippers" : "allBlanksOrFlippers";
        return Generator.filters( StateGen.create(size)[fname](),
                                  [StateFilter.successful(),
                                   StateFilter.nontrivial()] );
    }

    function presentSequence( gen ) {
        var limit = 10000,
            xs = Generator.take( limit + 1, gen ),
            andMore = xs.length === (limit + 1);
        if( andMore ) {
            xs.pop();
        }
        xs.forEach( function(state) {
            var solved = Solver.solve( state );
            console.log( "Solution lasting " + solved.ticks + " ticks" );
            console.log( JSON.stringify( state ) );
        } );
        if( andMore ) {
            console.log( "..." );
        }
    }

    function main( operation, cols, rows ) {
        var size = { cols: parseInt( cols, 10 ),
                     rows: parseInt( rows, 10 ) },
            gen;
        console.log( "size " + JSON.stringify( size ) );
        if( operation == "denseFlippers" ) {
            gen = generateDenseFlippers( size );
        } else if( operation == "blanksOrFlippers" ) {
            gen = generateBlanksOrFlippers( size, false );
        } else if( operation == "randomBlanksOrFlippers" ) {
            gen = generateBlanksOrFlippers( size, true );
        } else {
            console.log( "operation unknown: " + operation );
            return;
        }

        console.log( "Generating..." );

        presentSequence( gen );
    }

    return {
        main: main
    };
}());

module.exports = StateGenUtil;
