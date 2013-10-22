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

    function shrinkFixed( marginSize ) {
        return AABB.create( {x: rect.x + marginSize,
                             y: rect.y + marginSize,
                             width: Math.max(0, rect.width - 2 * marginSize),
                             height: Math.max(0, rect.height - 2 * marginSize)} );
    }

    function gridsplit( specs ) {
        var col = 0,
            row = 0,
            rv = [],
            w = rect.width / specs.cols,
            h = rect.height / specs.rows;
        for(row = 0; row < specs.rows; row++) {
            for(col = 0; col < specs.cols; col++) {
                rv.push( AABB.create( {x: col * w,
                                       y: row * h,
                                       width: w,
                                       height: h} ) );
            }
        }
        return rv;
    }

    return {
        contains: inside,
        rect: getRect,
        hsplit: hsplit,
        vsplit: vsplit,
        gridsplit: gridsplit,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        shrinkFixed: shrinkFixed
    };
} };

module.exports = AABB;
