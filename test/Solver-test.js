var buster = require("buster");

var Solver = require("../src/Solver");
var SolverUtil = require("../src/SolverUtil");

var GameState = require("../src/GameState");

var TestPuzzles = {
    one:
    {"size": {"cols":7,"rows":7},
     "origin":{"col":3,"row":7},
     "initialVelocity":{"dx":0,"dy":-1},
     "target":{"col":3,"row":-1},
     "inventory": [{type: "breakable-square"},
                   {type: "breakable-triangle"}],
     "elements":[{"col":3,"row":6,"type":"breakable-triangle","rotation":1},
                 {"col":6,"row":6,"type":"breakable-triangle","rotation":3},
                 {"col":6,"row":3,"type":"breakable-triangle","rotation":0},
                 {"col":1,"row":3,"type":"breakable-triangle","rotation":1},
                 {"col":0,"row":1,"type":"breakable-triangle","rotation":1},
                 {"col":4,"row":1,"type":"breakable-triangle","rotation":0},
                 {"col":4,"row":4,"type":"breakable-square"},
                 {"col":3,"row":5,"type":"breakable-triangle","rotation":3},
                 {"col":3,"row":0,"type":"breakable-triangle","rotation":1},
                 {"col":1,"row":0,"type":"breakable-triangle","rotation":1},
                 {"col":0,"row":4,"type":"breakable-triangle","rotation":2},
                 {"col":0,"row":5,"type":"breakable-triangle","rotation":1},
                 {"col":1,"row":6,"type":"breakable-triangle","rotation":3},
                 {"col":0,"row":6,"type":"breakable-triangle","rotation":2},
                 {"col":5,"row":2,"type":"breakable-triangle","rotation":3},
                 {"col":1,"row":1,"type":"breakable-triangle","rotation":1},
                 {"col":4,"row":0,"type":"breakable-triangle","rotation":0},
                 {"col":5,"row":1,"type":"breakable-triangle","rotation":0},
                 {"col":2,"row":2,"type":"breakable-square"},
                 {"col":6,"row":2,"type":"breakable-triangle","rotation":3},
                 {"col":6,"row":0,"type":"breakable-triangle","rotation":0}]
     },
    two:
    {"size":{"cols":3,"rows":3},
     "origin":{"col":1,"row":3},
     "initialVelocity":{"dx":0,"dy":-1},
     "target":{"col":1,"row":-1},
     "elements":[{"col":1,"row":1,
                  "type":"flipper",
                  "ascending":true,"colour":"red"},
                 {"col":2,"row":1,
                  "type":"flipper",
                  "ascending":true,"colour":"red"},
                 {"col":2,"row":0,
                  "type":"flipper",
                  "ascending":false,"colour":"red"}],
     "inventory": [{type: "flipper"}]
    },
    excess:
    {"size":{"cols":3,"rows":3},
     "origin":{"col":1,"row":3},
     "initialVelocity":{"dx":0,"dy":-1},
     "target":{"col":1,"row":-1},
     "elements":[{"col":1,"row":1,
                  "type":"flipper",
                  "ascending":true,"colour":"red"},
                 {"col":2,"row":1,
                  "type":"flipper",
                  "ascending":true,"colour":"red"},
                 {"col":2,"row":0,
                  "type":"flipper",
                  "ascending":false,"colour":"red"}],
     "inventory": [{type: "flipper"},
                   {type: "flipper"}]
    }
};
  
buster.testCase( "Solver scenarios", {
    "basic ascending flip": function() {
        var report = Solver.solve( {size: {cols: 3, rows: 3},
                                   origin: {col: 1, row: 3},
                                   initialVelocity: {dx: 0, dy: -1},
                                   target: {col: 1, row: -1},
                                   elements: [{type: "flipper",
                                               col: 1,
                                               row: 1,
                                               ascending: true}]
                                   } );
	buster.assert.less( report.ticks, 10 );
        buster.assert.equals( report.position, {col: 3, row: 1} );
    },
    "basic descending flip": function() {
        var report = Solver.solve( {size: {cols: 3, rows: 3},
                                   origin: {col: 1, row: 3},
                                   initialVelocity: {dx: 0, dy: -1},
                                   target: {col: 1, row: -1},
                                   elements: [{type: "flipper",
                                               col: 1,
                                               row: 1,
                                               ascending: false}]
                                   } );
	buster.assert.less( report.ticks, 10 );
        buster.assert.equals( report.position, {col: -1, row: 1} );
    },
    "infinite loop": function() {
        var report = Solver.solve( {"size":{"cols":7,"rows":7},"origin":{"col":3,"row":7},"initialVelocity":{"dx":0,"dy":-1},"target":{"col":3,"row":7},"elements":[{"col":3,"row":4,"type":"square","colour":"red","deactivated":true},{"col":3,"row":2,"type":"square","colour":"red","deactivated":true},{"col":3,"row":3,"type":"switch","colour":"red"}],"ball":{"position":{"col":3,"row":7},"incomingVelocity":{"dx":0,"dy":1},"outgoingVelocity":{"dx":0,"dy":1}},"status":"gameover:win" } );
        
        buster.assert.greater( report.ticks, 100 );
        buster.assert.equals( report.result, null );
    }
} );

buster.testCase( "Solver search", {
    "simple": function() {
        var solutions = Solver.search( TestPuzzles.two );
        buster.assert.equals( solutions.length, 1 );

        var solution = GameState.load( solutions[0] );
        var placed = solution.elementAtCell( {col: 1, row: 0} );
        
        buster.refute.equals( placed, null );
        buster.assert.equals( placed.ascending, false );
    },
    "realistic uniqueness": function() {
        var solutions = Solver.search( TestPuzzles.one );
        solutions.forEach(function(solution) {
            console.log( "Solution in " + Solver.solve( solution ).ticks + " ticks " + JSON.stringify( solution ) );
        } );
        buster.assert.equals( solutions.length, 1 );
    },
    "extra inventory": function() {
        var solutions = Solver.search( TestPuzzles.excess );
        // The solver should use the least amount of pieces possible.
        // E.g. if it's possible to solve the puzzle with 1 piece, don't bother
        // doing a search on how to do it with 2.
        buster.assert.equals( solutions.length, 1 );
    }
} );

buster.testCase( "SolverUtil", {
    "analysis": function() {
        var reports = SolverUtil.analyzePuzzle( TestPuzzles.one ),
            analysis = reports[0].analysis;
        buster.assert.equals( reports.length, 1 );
        buster.assert.isNumber( analysis.ticks );
        buster.assert.isNumber( analysis.switches );
        buster.assert.isNumber( analysis.rollovers );
        buster.assert.isNumber( analysis.squaresVisited );
        buster.assert.isNumber( analysis.noninteractiveConnections );
        buster.assert.isNumber( analysis.bounces );
        buster.assert.isNumber( analysis.untouchedPieces );
        buster.assert.isNumber( analysis.multitouchedPieces );
    }
} );

