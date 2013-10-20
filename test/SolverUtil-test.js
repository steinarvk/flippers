var buster = require("buster");

var SolverUtil = require("../src/SolverUtil");

var AmbiguousPuzzle = {
   "size": {
       "cols": 5,
       "rows": 5
   },
   "origin": {
       "col": 2,
       "row": 5
   },
   "initialVelocity": {
       "dx": 0,
       "dy": -1
   },
   "target": {
       "col": 2,
       "row": -1
   },
   "elements": [
       {
           "col": 2,
           "row": 0,
           "type": "flipper",
           "ascending": true,
           "colour": "red"
       },
       {
           "col": 2,
           "row": 2,
           "type": "flipper",
           "ascending": false,
           "colour": "red"
       }
   ],
   "inventory": [
       {
           "type": "flipper",
           "ascending": false,
           "colour": "red"
       },
       {
           "type": "flipper",
           "ascending": false,
           "colour": "red"
       }
   ]
};

buster.testCase( "SolverUtil", {
    "ambiguous puzzle": function() {
        var solutions = SolverUtil.analyzePuzzle( AmbiguousPuzzle );
        buster.assert.equals( solutions.length, 2 );
    }
} );
