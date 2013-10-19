"use strict";

var AABB = require("./AABB");
var Regions = require("./Regions");
var RegionGrid = require("./RegionGrid");
var Util = require("./Util");

module.exports = {create: function( select, area, size, options ) {
    var grid = RegionGrid.create( area, size, options ),
        itemRegions = [],
        pageSize = size.cols * size.rows,
        currentPage = 0,
        fullRegion = AABB.create( area ),
        selected = null;

    function getFullRegion() {
        return fullRegion;
    }

    function cellNo( i ) {
        var pageNo = Math.floor( i / pageSize ),
            rowNo = Math.floor( (i - pageNo * pageSize) / size.cols ),
            colNo = i - pageNo * pageSize - rowNo * size.cols;
        return {col: colNo,
                row: rowNo,
                page: pageNo,
                index: i};
    }
    
    function addItem( item ) {
        var i = 0, cell;

        while( itemRegions[i] ) {
            ++i;
        }

        cell = cellNo( i );
        itemRegions[i] = Util.mergeInto( grid.cell( cell ),
                                         cell,
                                         {item: item} );
        return itemRegions[i];
    }

    function onActiveItems( f ) {
        var i0 = currentPage * pageSize,
            i, region;

        for(i = 0; i < pageSize; i++) {
            region = itemRegions[i0 + i];
            if( region ) {
                f( region );
            }
        }
    }

    function pageRegions() {
        var page = Regions.create();
        onActiveItems( function(itemregion) {
            page.add( itemregion );
        } );
        return page;
    }

    function draw( gfx ) {
        onActiveItems( function(itemregion) {
            if( !itemregion.blank ) {
                gfx.drawInventoryItemIn( itemregion.item,
                                         {selected: itemregion === selected},
                                         itemregion.rect() );
            }
        } );
    }
    
    
    function numberOfPages() {
        return Math.ceil( itemRegions.length / pageSize );
    }

    function setPage( i ) {
        var n = numberOfPages();
        if( n === 0 ) {
            i = 0;
        } else {
            i = ((i % n) + n) % n;
        }
        currentPage = i;
    }

    function nextPage() {
        setPage( currentPage + 1 );
    }

    function previousPage() {
        setPage( currentPage - 1 );
    }

    function setSelected( region ) {
        selected = region;
        if( region ) {
            setPage( region.page );
        }
        select( selected );
    }

    function deltaSelected( di ) {
        var index, n;

        if( !itemRegions.length ) {
            setSelected( null );
            return;
        }

        if( !selected ) {
            index = 0;
        } else {
            n = itemRegions.length;
            index = (selected.index + di) % n;
            index = (index + n) % n;
        }

        setSelected( itemRegions[index] );
    }

    function nextSelected() {
        deltaSelected(1);
    }

    function previousSelected() {
        deltaSelected(-1);
    }

    return {
        add: addItem,
        render: draw,
        numberOfPages: numberOfPages,
        setPage: setPage,
        nextPage: nextPage,
        previousPage: previousPage,
        region: getFullRegion,
        pageRegions: pageRegions,
        setSelected: setSelected,
        nextSelected: nextSelected,
        previousSelected: previousSelected
    };
} };


