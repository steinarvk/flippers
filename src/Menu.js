var Regions = require("./Regions");
var AABB = require("./AABB");

var Menu = {create: function(canvas, area, items) {
    var ctx = canvas.getContext("2d");
    var regions = Regions.create();
    var fontStyle = null;
    var fontWidth = null;
    var mouse = null;

    function setMouse( m ) {
        mouse =  m;
    }

    function regionIsActive( region ) {
        if( !mouse ) {
            return false;
        }

        var p = mouse.lastPosition();

        if( !p ) {
            return false;
        }

        return region.contains( p );
    }

    (function() {
        var widthSlack = 0.9;
        var heightSlack = 0.9;
        var maxWidth = Math.floor( area.width * 0.9 );
        var height = Math.min( 150, Math.floor( area.height * 0.9 / items.length ) );
        
        var padding = 0.1;

        var pad = Math.max( maxWidth * padding * 0.5, height * padding * 0.5 );

        var fontHeight = Math.floor( Math.max( 10, (height - 2 * pad) * 0.9 ) );

        fontWidth = Math.floor( maxWidth * 0.9 );

        fontStyle = "bold " + fontHeight + "px sans-serif";

        var y = Math.floor( area.height * (1.0 - heightSlack) * 0.5 );
        var x = Math.floor( area.width * (1.0 - widthSlack) * 0.5 );

        for(var i = 0; i < items.length; i++) {
            var region = AABB.create( {x: area.x + x + pad,
                                       y: area.y + y + pad,
                                       width: maxWidth - 2 * pad,
                                       height: height - 2 * pad} );
            y += height;
            regions.add( $.extend( region, {item: items[i]} ) );
        }
    })();

    function draw() {
        regions.onRegions( function(region) {
            var r = region;
            
            if( regionIsActive( r ) ) {
                ctx.fillStyle = "yellow";
            } else {
                ctx.fillStyle = "blue";
            }
            ctx.fillRect( r.x, r.y, r.width, r.height );

            ctx.fillStyle = "black";

            ctx.font = fontStyle;
            ctx.textBaseline = "top";
            ctx.textAlign = "center";
            ctx.fillText( region.item.text,
                          r.x + r.width * 0.5,
                          r.y );
        } );
    }

    function mouseHandler(p) {
        var region = regions.at( {x: p.x - area.x,
                                  y: p.y - area.y} );
        if( !region ) {
            return null;
        }
        
        return {
            tap: function() {
                region.item.activate();
            }
        };
    }

    return {
        draw: draw,
        mouseHandler: mouseHandler,
        setMouse: setMouse
    };
} };

module.exports = Menu;
