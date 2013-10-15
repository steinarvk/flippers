var AABB = require("./AABB");

var Icon = {create: function(region,pictures,name,handler,options) {
    var pad = null;
    var pic = null;
    var sz = null;
    var subregion = null;

    function setIconName(newName) {
        name = newName;
        pic = null;

        autoload();
    }

    function autoload() {
        if( pic ) {
            return;
        }
        if( !pictures[name] ) {
            return;
        }

        pic = pictures[name];
        
        var maxfill = (options && options.maxfill) || 1.0;

        console.log( "maxfill for " + name + " is " + maxfill );

        var sc = Math.min( maxfill * region.width / pic.width,
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

    return $.extend( {
        setIcon: setIconName,
        draw: draw,
        mouseHandler: mouseHandler
    }, AABB.create( region ) );
} };

module.exports = Icon;
