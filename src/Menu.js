"use strict";

var Regions = require("./Regions");
var AABB = require("./AABB");
var Label = require("./Label");
var Util = require("./Util");

var Menu = {create: function(canvas, area, items, mouse, options) {
    var ctx = canvas.getContext("2d"),
        regions = Regions.create(),
        labels = [];

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
        var widthSlack = 0.9,
            heightSlack = 0.9,
            maxWidth = Math.floor( area.width * 0.9 ),
            height = Math.min( 150, Math.floor( area.height * 0.9 / items.length ) ),
            padding = 0.1,
            pad = Math.max( maxWidth * padding * 0.5, height * padding * 0.5 ),
            y = Math.floor( area.height * (1.0 - heightSlack) * 0.5 ),
            x = Math.floor( area.width * (1.0 - widthSlack) * 0.5 ),
            region, sz, i;

        for(i = 0; i < items.length; i++) {
            region = AABB.create( {x: area.x + x + pad,
                                       y: area.y + y + pad,
                                       width: maxWidth - 2 * pad,
                                       height: height - 2 * pad} );
            labels.push( Label.create( canvas, region, items[i].text ) );
            y += height;
            regions.add( Util.mergeInto( region, {item: items[i]} ) );
        }

        sz = Math.min.apply( null, labels.map( function(x){
            return x.getSize();
        } ) );
        
        console.log( "normalize on size " + sz );

        labels.forEach( function(label) {
            label.setSize( sz );
        } );
    }());

    function draw() {
        regions.onRegions( function(region) {
            var r = region;
            
            if( regionIsActive( r ) ) {
                ctx.fillStyle = "#ccf";
            } else {
                ctx.fillStyle = "#99c";
            }
            ctx.fillRect( r.x, r.y, r.width, r.height );
        } );

        labels.forEach( function(x) { x.render(); } );

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
        back: (options && options.back)
    };
} };

module.exports = Menu;
