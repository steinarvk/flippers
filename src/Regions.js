"use strict";

module.exports = {create: function() {
    // This is one of those vague pieces of code where the point of it
    // is that it COULD be more efficient, even if it currently isn't.
    // So if we later want to make this a quadtree, that option is there.

    var regions = [];

    function addRegion( region ) {
	regions.push( region );
    }

    function getRegionsAt( pos ) {
	return regions.filter( function( region ) {
	    return region.contains( pos );
	} );
    }

    function getRegionAt( pos ) {
	var rv = getRegionsAt( pos );
	if( rv ) {
	    return rv[0];
	}
        return null;
    }

    function onEachRegion( f ) {
	regions.forEach( f );
    }

    return {
	add: addRegion,
	at: getRegionAt,
	onRegions: onEachRegion,
	allAt: getRegionsAt
    };
} };
