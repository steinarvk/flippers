"use strict";

var fs = require("fs");

var StateGen = require("./StateGen");
var StateFilter = require("./StateFilter");
var Solver = require("./Solver");
var Generator = require("./Generator");
var Util = require("./Util");
var PieceUtil = require("./PieceUtil");
var Random = require("./Random");
var GameState = require("./GameState");
var Map2D = require("./Map2D");

var StateGenUtil = (function() {
    function log( message ) {
        fs.writeSync(1, message + "\n" );
    }

    function findTickTouched( data, cell ) {
        var state = GameState.load( data ),
            rv = null,
            ticks = 0;
        Solver.solve( data, { hooks: {
            onTick: function() {
                ++ticks;
            },
            onInteraction: function( element ) {
                if( rv === null && cell.col === element.col && cell.row === element.row ) {
                    console.log( "element " + JSON.stringify( cell ) + " touched at tick " + ticks );
                    rv = ticks;
                }
            }
        } } );
        return rv;
    }

    function findInteractionsAfterTick( data, tick ) {
        var state = GameState.load( data ),
            rv = 0,
            ticks = 0;
        Solver.solve( data, { hooks: {
            onTick: function() {
                ++ticks;
            },
            onInteraction: function( element ) {
                if( ticks >= tick ) {
                    console.log( "interaction at " + JSON.stringify( element ) + " after tick " + tick );
                    ++rv;
                }
            }
        } } );
        return rv;
    }

    function puzzlifyGreedy( puzzle, n, options ) {
        var i, newPuzzle, bestTicks, normalTouchTick, graceTicks, bestPuzzle, outgoes, score, bestScore;

        puzzle = Util.jsonCopy( puzzle );
        if( n === 0 ) {
            return puzzle;
        }
        if( puzzle.inventory === undefined ) {
            puzzle.inventory = [];
        }

        for(i = 0; i < puzzle.elements.length; i++) {
            console.log( "investigating time touch of " + JSON.stringify( puzzle.elements[i] ) );
            normalTouchTick = findTickTouched( puzzle, puzzle.elements[i] );
            if( normalTouchTick === null ) {
                continue;
            }

            newPuzzle = Util.jsonCopy( puzzle );
            outgoes = newPuzzle.elements.splice(i,1)[0];
            console.log( "out goes: " + JSON.stringify( outgoes ) );
            newPuzzle.inventory.push( PieceUtil.normalizePiece( outgoes ) );

            if( !StateFilter.uniqueSolution()( newPuzzle ) ) {
                console.log( "filtered" );
                continue;
            }

            score = findInteractionsAfterTick( newPuzzle, normalTouchTick );

            console.log( "score is " + score );

            if( options && options.minConfusion && score < options.minConfusion ) {
                console.log( "filtered by confusion" );
                continue;
            }

//            graceTicks = Solver.solve( newPuzzle ).ticks - normalTouchTick;
            
            if( score > 0 && (!bestScore || score > bestScore) ) {
                console.log( "score " + score + " beats " + bestScore );
                bestScore = score;
                bestPuzzle = newPuzzle;
            }
        }
        
        console.log( "with score " + bestScore + " chosen was " + JSON.stringify( outgoes ) );

        if( !bestPuzzle ) {
            return null;
        }
        
        return puzzlifyGreedy( bestPuzzle, n - 1, options);
    }

    function puzzlify( puzzle, options ) {
        var rv = puzzlifyGreedy( puzzle, options.invSize || 2, options );
//        puzzle = Util.jsonCopy( puzzle );
//       puzzle.inventory = Random.removingDraw( puzzle.elements,
//                                              2 );
//      puzzle.inventory = puzzle.inventory.map( PieceUtil.normalizePiece );
//      return puzzle;
        return rv;
    }

    function stripPuzzle( puzzle ) {
        // Strip, but only if it doesn't destroy uniqueness
        var uniq = StateFilter.uniqueSolution(),
            untouchedPieces = Map2D.create(),
            solutions = Solver.search( puzzle ),
            solution = solutions[0],
            puzzleState = GameState.load( puzzle ),
            state = GameState.load( solution ),
            strippedState,
            i;

        for( i = 0; i < solution.elements.length; i++ ) {
            untouchedPieces.set( solution.elements[i].col,
                                 solution.elements[i].row,
                                 true );
        }

        Solver.solve( solution, { hooks: {
            onInteraction: function( element ) {
                untouchedPieces.remove( element.col, element.row );
            }
        } } );

        state.onAllCells( function(cell) {
            if( !puzzleState.elementAtCell( cell ) ) {
                state.removeElementAtCell( cell );
            }
        } );

        untouchedPieces.forEach( function(col, row, element) {
            var strippedPuzzle = Util.jsonCopy( puzzle );
            strippedPuzzle.elements = Util.jsonCopy( state.save().elements );
            strippedState = GameState.load( state.save() );
            strippedState.removeElementAtCell( {col: col, row: row} );
            strippedPuzzle.elements = Util.jsonCopy( strippedState.save().elements );
            if( uniq( strippedPuzzle ) ) {
                state = strippedState;
            }
        } );
        
        puzzle = Util.jsonCopy( puzzle );
        puzzle.elements = Util.jsonCopy( state.save().elements );

        return puzzle;
    }

    function strip( solution ) {
        var untouchedPieces = Map2D.create(),
            state = GameState.load( solution ),
            i;

        for( i = 0; i < solution.elements.length; i++ ) {
            untouchedPieces.set( solution.elements[i].col,
                                 solution.elements[i].row,
                                 true );
        }

        Solver.solve( solution, { hooks: {
            onInteraction: function( element ) {
                untouchedPieces.remove( element.col, element.row );
            }
        } } );

        untouchedPieces.forEach( function(col, row, element) {
            state.removeElementAtCell( {col: col, row: row} );
        } );

        return state.save();
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
            xs = Generator.takeGen( limit, gen );
        Generator.forEach( xs, function(puzzle) {
            var solutions = Solver.search( puzzle );
            log( "Puzzle with " + solutions.length + " solutions" );
            log( "Solution lasts " + Solver.solve(solutions[0]).ticks + " ticks" );
            log( JSON.stringify( puzzle ) );
            log( JSON.stringify( solutions[0] ) );
        } );
    }

    function adjustPuzzleSequence( gen, options ) {
        gen = Generator.filters( gen,
                                 [StateFilter.uniqueSolution()] );
        return gen;
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

        gen = Generator.map( gen, strip );

        gen = Generator.map( gen, function(x) {
            return puzzlify(x, options);
        } );

        gen = Generator.filter( gen, Util.identity );

        gen = adjustPuzzleSequence( gen, options );

        gen = Generator.map( gen, stripPuzzle );

        presentSequence( gen, options );
    }

    return {
        main: main
    };
}());

module.exports = StateGenUtil;
