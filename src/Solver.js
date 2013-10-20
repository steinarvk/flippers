"use strict";

var GameState = require("./GameState");

var Util = require("./Util");
var Generator = require("./Generator");

var Solver = (function() {
    function setupContext(state) {
        return {ticks: 0};
    }
    
    function observeState( context, game ) {
        context.ticks++;
    }

    function reportState( context, game ) {
        var result = null;
        if( game.status() === "gameover:win" ) {
            result = "win";
        } else if( game.status() === "gameover:loss" ) {
            result = "loss";
        }

        return {ticks: context.ticks,
                result: result,
                position: game.ball().position,
                velocity: game.ball().outgoingVelocity};
    }

    function solve( state, options ) {
        var limit = (options && options.limit) || 1000,
            game, key, i, context;

        if( state.origin ) {
            game = GameState.load( state );
        } else {
            game = GameState.loadOld( state );
        }

        if( options && options.hooks ) {
            for(key in options.hooks) {
                if( options.hooks.hasOwnProperty(key) ) {
                    game.addHook( key, options.hooks[key] );
                }
            }
        }

        context = setupContext( game.save() );

        game.start();

        for(i = 0; i < limit; i++) {
            observeState( context, game );

            if( game.status() !== "running" ) {
                break;
            }

            game.advance();
        }

        return reportState( context, game );
    }

    function pieceConfigurations( piece ) {
        function adjoin(m) {
            return Util.merge( piece, m );
        }
        var rv = [],
            i;
        if( piece.type === "triangle" || piece.type === "breakable-triangle") {
            for(i = 0; i < 4; i++) {
                rv.push( adjoin( {rotation: i} ) );
            }
        } else if( piece.type === "flipper" ) {
            rv.push( adjoin( {ascending: true} ) );
            rv.push( adjoin( {ascending: false} ) );
        } else {
            rv.push( adjoin( {} ) );
        }
        return rv;
    }
    
    function search( puzzle, options ) {
        // Puzzle has .inventory, and is otherwise a start state.
        // We can expect that each puzzle expands to ~ 2 x 40^puzzle.inventory.length potential solutions
        // This means we're capable of naive exhaustive search for up to around 3 puzzle pieces, meaning most puzzles.
        // We can also cut down the search space by adjoining a piece at a time and always placing it
        // in the path of the ball.
        // (However, note that this means we would have to try all possible orders of placing the puzzle pieces.)
        var solutions = [],
            inventorygen = Generator.orderedSubseqs( puzzle.inventory ),
            nextInventory,
            leastInventorySize,
            solutionsHere,
            triedInventories = [],
            inventoryAlreadyTried;

        function inventoryEquivalentTo(x) {
            return function(y) {
                return Util.multisetsEqual( x, y, Util.jsonEqual );
            };
        }

        nextInventory = inventorygen();

        do {
            inventoryAlreadyTried = triedInventories
                .map( inventoryEquivalentTo )
                .some( Util.appliedOn( [nextInventory] ) );
            if( inventoryAlreadyTried ) {
                nextInventory = inventorygen();
                continue;
            }


            triedInventories.push( nextInventory );

            solutionsHere = searchInventory( puzzle,
                                             options,
                                             nextInventory );
            if( solutionsHere.length ) {
                leastInventorySize = nextInventory.length;

                solutions = solutions.concat( solutionsHere );
            }

            nextInventory = inventorygen();
        } while( nextInventory
                 && (leastInventorySize === undefined
                     ||
                     nextInventory.length === leastInventorySize) );

        return solutions;
    }

    function searchInventory( puzzle, options, inventory ) {
        // Naive search

        var baseState = GameState.load( puzzle ),
            sets = [],
            solutions = [],
            moveCells = [],
            i, j, cell, gen;

        for(i = 0; i < puzzle.size.cols; i++) {
            for(j = 0; j < puzzle.size.rows; j++) {
                cell = {col: i, row: j};
                if( !baseState.elementAtCell( cell ) ) {
                    moveCells.push( cell );
                }
            }
        }

        for(i = 0; i < inventory.length; i++) {
            sets.push( moveCells );
            sets.push( pieceConfigurations( inventory[i] ) );
        }

        gen = Generator.filter(
            Generator.product.apply( null, sets ),
            function ( moves ) {
                // Check that all the locations are unique
                var index;
                for(index = 0; index < moves.length; index += 2) {
                    if( moves.indexOf( moves[index] ) < index) {
                        return false;
                    }
                }
                return true;
            }
        );
        
        Generator.forEach( gen, function( n ) {
            var state = GameState.load( puzzle ),
                index, celldata, piecedata, result;

            for(index = 0; index < n.length; index += 2) {
                celldata = n[index];
                piecedata = n[index+1];
                state.setElement( Util.merge( celldata, piecedata ) );
            }

            result = Solver.solve( state.save() );
            if( result.result === "win" ) {
                solutions.push( state.save() );
            }
        } );
        
        solutions = solutions.map( JSON.stringify );
        solutions = Util.uniqueElements( solutions );
        solutions = solutions.map( JSON.parse );

        return solutions;

    }

    return {
        solve: solve,
        search: search
    };
}());

module.exports = Solver;
