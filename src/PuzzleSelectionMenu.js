"use strict";

var Regions = require("./Regions");
var AABB = require("./AABB");
var Util = require("./Util");
var PuzzlePreview = require("./PuzzlePreview" );
var Label = require("./Label");

var PuzzleSelectionMenu = {create: function(canvas,
                                            area,
                                            puzzles,
                                            mouse,
                                            options,
                                            handlers) {
    var ctx = canvas.getContext("2d");
    var regions = Regions.create();
    var marginSize = options.marginSize || 10;

    area = AABB.create( area );
    var sections = Util.nameArray( ["wholegrid","buttons"],
                                   area.vsplit( [{},
                                                 {fixed: 100}] ) );
    Util.mergeInto( sections,
                    Util.nameArray( ["prev", "next"],
                                    sections.buttons.hsplit( [{},{}] ) ) );
    
    var grid = findGrid( Math.max( options.pageSize || 0,
                                   puzzles.length ) );


    sections.grid = sections.wholegrid.gridsplit( grid );

    sections.grid = sections.grid.map(
        function(x) { return x.shrinkFixed( marginSize ); }
    );

    function setupPreviews() {
        var i;
        for(i = 0; i < puzzles.length; i++) {
            regions.add( Util.mergeInto(
                sections.grid[i],
                {type: "puzzle",
                 renderable: PuzzlePreview.create( canvas,
                                                   sections.grid[i],
                                                   puzzles[i] ),
                 puzzle: puzzles[i]}
            ) );
        }
    }

    function setupPrevNext() {
        regions.add( Util.mergeInto(
            sections.prev,
            {type: "button",
             buttonName: "prev",
             renderable: Label.create( canvas,
                                       sections.prev,
                                       "\u21E6" )} ) );
        regions.add( Util.mergeInto(
            sections.next,
            {type: "button",
             buttonName: "next",
             renderable: Label.create( canvas,
                                       sections.next,
                                       "\u21E8" )} ) );
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

    function render() {
        regions.forEach( function(region) {
            if( regionIsActive( region ) ) {
                ctx.fillStyle = "#ccf";
            } else {
                ctx.fillStyle = "#99c";
            }
            ctx.fillRect( region.x, region.y, region.width, region.height );

            region.renderable.render();
        } );
    }

    function mouseHandler(p) {
        var region = regions.at( {x: p.x - area.x,
                                  y: p.y - area.y} );

        console.log( "region click " + JSON.stringify(p) );

        if( !region ) {
            return null;
        }

        console.log( "reigon cloc " + region.type );

        switch( region.type ) {
        case "button":
            return {
                tap: function() {
                    handlers[ region.buttonName ]();
                }
            };
        case "puzzle":
            return {
                tap: function() {
                    handlers.puzzle( region.puzzle );
                }
            };
        }

        return null;
    }

    function findGrid( n ) {
        var cols = 2,
            rows = 2,
            rowsNext = false;
        while( n > (cols * rows) ) {
            if( rowsNext ) {
                ++rows;
            } else {
                ++cols;
            }
            rowsNext = !rowsNext;
        }
        return {cols: cols, rows: rows};
    }

    setupPreviews();
    setupPrevNext();

    return {
        render: render,
        draw: render,
        mouseHandler: mouseHandler,
        back: handlers.back
    };
} };

module.exports = PuzzleSelectionMenu;
