"use strict";

var Stopwatch = {create: function() {
    var ms0 = new Date().getTime();

    return {
        ms: function() {
            return new Date().getTime() - ms0;
        }
    };
} };

module.exports = Stopwatch;
