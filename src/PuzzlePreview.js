"use strict";

var GameState = require("./GameState");
var Label = require("./Label");
var AABB = require("./AABB");

var PuzzlePreview = (function(area, puzzle) {
    area = AABB.create( area );

    var sections = Util.nameArray(
	["preview", "inventory", "author", "name"],
	area.vsplit( [{fixed: area.width},
		      {share: 2},
		      {},
		      {}] ) );

        
    
    


    
    return {
	draw
    };
}());

module.exports = PuzzlePreview;