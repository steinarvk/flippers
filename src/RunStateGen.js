"use strict";

var StateGenUtil = require("./StateGenUtil");

var args = process.argv.splice(2);
StateGenUtil.main.apply( null, args );
