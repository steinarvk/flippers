"use strict";

var Util = require( "./Util" );

var Hooks = {create: function() {
    var hooks = {};

    function addHook(name, fun) {
        if( hooks[name] ) {
            hooks[name].push( fun );
        } else {
            hooks[name] = [ fun ];
        }

        return function() {
            Util.arrayRemoveElement( hooks[name], fun );
        };
    }

    function runHook(name) {
        var args = [].slice.apply( arguments ),
            h = hooks[name],
            i;

        args.shift();

        if( h ) {
            for(i = 0; i < h.length; i++) {
                h[i].apply( null, args );
            }
        }
    }

    return {
        add: addHook,
        run: runHook
    };
}};

module.exports = Hooks;
