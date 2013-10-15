var Util = require("./Util");

var Resources = {create: function(resources) {
    var obj = {store: {},
               done: 0,
               remaining: 0};

    var suffixes = {
        ".png": "image",
        ".jpg": "image",
        ".jpeg": "image",
        ".gif": "image"
    };

    var functions = {
        "image": loadImage
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

    function identifyResource( s ) {
        for(var suffix in suffixes) {
            if( Util.endsWith( s, suffix ) ) {
                return functions[ suffixes[ suffix ] ];
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

    for(var key in resources) {
        requestResource( key, resources[ key ] );
    }

    return obj;
} };

module.exports = Resources;
