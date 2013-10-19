"use strict";

var AABB = require("./AABB");
var Util = require("./Util");

var Icon = {create: function(region,pictures,name,handler,options) {
    var pad = null,
        pic = null,
        sz = null,
        subregion = null;

    function autoload() {
        if( pic ) {
            return;
        }
        if( !pictures[name] ) {
            return;
        }

        var sc, maxfill;

        pic = pictures[name];
        
        maxfill = (options && options.maxfill) || 1.0;

        console.log( "maxfill for " + name + " is " + maxfill );

        sc = Math.min( maxfill * region.width / pic.width,
                       maxfill * region.height / pic.height );
        
        console.log( " scaling " + sc );
       
        sz = {width: Math.floor( pic.width * sc ),
              height: Math.floor( pic.height * sc )};
        pad = {x: Math.floor( 0.5 * (region.width - sz.width) ),
               y: Math.floor( 0.5 * (region.height - sz.height) )};

        subregion = AABB.create( {x: region.x + pad.x,
                                  y: region.y + pad.y,
                                  width: sz.width,
                                  height: sz.height} );
    }

    function setIconName(newName) {
        name = newName;
        pic = null;

        autoload();
    }

    function draw(ctx) {
        autoload();

        if( pic ) {
            ctx.drawImage( pic,
                           region.x + pad.x,
                           region.y + pad.y,
                           sz.width,
                           sz.height );
        }
    }

    function mouseHandler(click) {
        if( !subregion.contains( click ) ) {
            return null;
        }

        return handler;
    }

    return Util.merge( {
        setIcon: setIconName,
        draw: draw,
        mouseHandler: mouseHandler
    }, AABB.create( region ) );
} };

module.exports = Icon;
