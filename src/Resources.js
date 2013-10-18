/*jslint browser: true*/

"use strict";

var Util = require("./Util");

var Resources = {create: function(resources) {
    var obj = {store: {},
               done: 0,
               remaining: 0},
        suffixes = {
            ".png": "image",
            ".jpg": "image",
            ".jpeg": "image",
            ".gif": "image"
        };

    function loadImage( name, url ) {
        var img = new Image();
        obj.remaining++;
        img.onload = function() {
            obj.store[ name ] = img;
            obj.done++;
            obj.remaining--;
        };
        img.src = url;
    }

    function getLoadFunction(name) {
        return {
            "image": loadImage
        }[ name ];
    }

    function identifyResource( s ) {
        var suffix;
        for(suffix in suffixes) {
            if( suffixes.hasOwnProperty( suffix ) ) {
                if( Util.endsWith( s, suffix ) ) {
                    return getLoadFunction( suffixes[ suffix ] );
                }
            }
        }
        return null;
    }

    function requestResource( name, resource ) {
        var f = identifyResource( resource );
        if( f ) {
            f( name, resource );
        } else {
            console.log( "cannot load unknown resource type " + resource );
        }
    }

    (function() {
        var key;
        for(key in resources) {
            if( resources.hasOwnProperty( key ) ) {
                requestResource( key, resources[ key ] );
            }
        }
    }());

    return obj;
} };

module.exports = Resources;
