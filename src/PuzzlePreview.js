"use strict";

var Label = require("./Label");
var AABB = require("./AABB");
var GameState = require("./GameState");
var Globals = require("./Globals");
var ImageGraphics = require("./ImageGraphics");
var Util = require("./Util");

var PuzzlePreview = {create: function(canvas, area, doc) {
    var sections,
        gfx,
        gameState,
        authorLabel,
        titleLabel,
        ctx;

    function initialize() {
        ctx = canvas.getContext("2d");
        area = AABB.create( area );
        sections = Util.nameArray(
	    ["preview", "inventory", "author", "name"],
	    area.vsplit( [{fixed: area.width},
		          {share: 2},
		          {},
		          {}] ) );
        console.log( "hello " + JSON.stringify( doc ) );
        gfx = ImageGraphics.create( canvas,
                                    Globals.resources.store,
                                    sections.preview,
                                    doc.puzzle.size );
        gameState = GameState.load( doc.puzzle );
        authorLabel = Label.create( canvas,
                                    sections.author,
                                    doc.author );
        titleLabel = Label.create( canvas,
                                   sections.name,
                                   doc.name );   
    }
    
    function render() {
        gameState.render( gfx );
        authorLabel.render();
        titleLabel.render();
    }

    function getArea() {
        return area;
    }

    initialize();
    
    return {
	render: render,
        area: getArea
    };
} };

module.exports = PuzzlePreview;
