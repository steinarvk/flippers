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
    },
    "infinite loop": function() {
        var report = Solver.solve( {"size":{"cols":7,"rows":7},"origin":{"col":3,"row":7},"initialVelocity":{"dx":0,"dy":-1},"target":{"col":3,"row":7},"elements":[{"col":3,"row":4,"type":"square","colour":"red","deactivated":true},{"col":3,"row":2,"type":"square","colour":"red","deactivated":true},{"col":3,"row":3,"type":"switch","colour":"red"}],"ball":{"position":{"col":3,"row":7},"incomingVelocity":{"dx":0,"dy":1},"outgoingVelocity":{"dx":0,"dy":1}},"status":"gameover:win" } );
        
        buster.assert.greater( report.ticks, 100 );
        buster.assert.equals( report.result, null );
    }
} );
