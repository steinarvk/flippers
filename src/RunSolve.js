"use strict";

var fs = require("fs");
var Solver = require("./Solver");

var args = process.argv.splice(2);

var filename = args[0];

var data = JSON.parse( fs.readFileSync( filename, "utf8" ) );

var solutions = Solver.search( data );

var n = solutions.length;

if( n === 1 ) {
    console.log( "Single solution found." );
} else if( n === 0 ) {
    console.log( "No solutions found!" );
} else {
    console.log( "Multiple solutions found! (" + n + " solutions)" );
}



