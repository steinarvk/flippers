var buster = require("buster");

var Solver = require("../src/Solver");

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
    }
} );