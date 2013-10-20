"use strict";

var FinisherUtil = require("./FinisherUtil");

var args = process.argv.splice(2);
FinisherUtil.main.apply( null, args );
