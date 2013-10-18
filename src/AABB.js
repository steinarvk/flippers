"use strict";

var LayoutShare = require("./LayoutShare");

var AABB = {create: function( rect ) {
    function inside( p ) {
        return p.x >= rect.x
            && p.y >= rect.y
            && p.x < (rect.x + rect.width)
            && p.y < (rect.y + rect.height);
    }
    
    function getRect() {
        return rect;
    }

    function hsplit( specs ) {
        var x0 = rect.x;
        return LayoutShare.allot( rect.width, specs ).map( function(w) {
            x0 += w;
            return AABB.create( {x: x0 - w,
                                 y: rect.y,
                                 width: w,
                                 height: rect.height} );
        } );
    }

    function vsplit( specs ) {
        var y0 = rect.y;
        return LayoutShare.allot( rect.height, specs ).map( function(h) {
            y0 += h;
            return AABB.create( {x: rect.x,
                                 y: y0 - h,
                                 width: rect.width,
                                 height: h } );
        } );
    }

    return {
        contains: inside,
        rect: getRect,
        hsplit: hsplit,
        vsplit: vsplit,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
    };
} };

module.exports = AABB;
