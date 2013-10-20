"use strict";

var fs = require("fs");

var StateGen = require("./StateGen");
var StateFilter = require("./StateFilter");
var Solver = require("./Solver");
var Generator = require("./Generator");
var Util = require("./Util");

var StateGenUtil = (function() {
    function log( message ) {
        fs.writeSync(1, message + "\n" );
     }

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

    function presentSequence( gen, options ) {
        var limit = options.limit || 10000,
            xs = Generator.takeGen( limit + 1, gen );
        Generator.forEach( xs, function(state) {
            var solved = Solver.solve( state );
            log( "Solution lasting " + solved.ticks + " ticks" );
            log( JSON.stringify( state ) );
        } );
    }

    function adjustSequence( gen, options ) {
        var standards = {
            good: {generated: 500,
                   quantile: 0.99}
        };

        if( options.ticks ) {
            (function() {
                var threshold = options.ticks;
                if( typeof threshold !== "number" ) {
                    (function() {
                        var standard = standards[threshold];
                        threshold = Util.quantile(
                            Generator.take( standard.generated, gen )
                                .map( function(state) {
                                    return Solver.solve(state).ticks;
                                } ),
                            standard.quantile );
                    }());
                }
                log( "ticks threshold " + threshold );
                gen = Generator.filter( gen, function(state) {
                    return Solver.solve(state).ticks >= threshold;
                } );
            }());
        }

        return gen;
    }

    function main( operation, cols, rows, options ) {
        var size = { cols: parseInt( cols, 10 ),
                     rows: parseInt( rows, 10 ) },
            gen;
        options = JSON.parse( options );
        log( "size " + JSON.stringify( size ) );
        if( operation == "denseFlippers" ) {
            gen = generateDenseFlippers( size );
        } else if( operation == "blanksOrFlippers" ) {
            gen = generateBlanksOrFlippers( size, false );
        } else if( operation == "randomBlanksOrFlippers" ) {
            gen = generateBlanksOrFlippers( size, true );
        } else {
            log( "operation unknown: " + operation );
            return;
        }

        log( "Generating..." );
        
        gen = adjustSequence( gen, options );

        presentSequence( gen, options );
    }

    return {
        main: main
    };
}());

module.exports = StateGenUtil;
