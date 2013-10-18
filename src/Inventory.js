var AABB = require("./AABB");
var Regions = require("./Regions");
var RegionGrid = require("./RegionGrid");
var Util = require("./Util");

module.exports = {create: function( select, area, size, options ) {
    var grid = RegionGrid.create( area, size, options );
    var itemRegions = [];
    var pageSize = size.cols * size.rows;
    var currentPage = 0;
    var fullRegion = AABB.create( area );
    var selected = null;

    function setSelected( region ) {
        selected = region;
        if( region ) {
            setPage( region.page );
        }
        select( selected );
    }

    function region() {
        return fullRegion;
    }

    function cellNo( i ) {
        var pageNo = Math.floor( i / pageSize );
        var rowNo = Math.floor( (i - pageNo * pageSize) / size.cols );
        var colNo = i - pageNo * pageSize - rowNo * size.cols;
        return {col: colNo,
                row: rowNo,
                page: pageNo,
                index: i};
    }
    
    function addItem( item ) {
        var i = 0;
        while( itemRegions[i] ) {
            ++i;
        }
        var cell = cellNo( i );
        itemRegions[i] = Util.mergeInto( grid.cell( cell ),
                                         cell,
                                         {item: item} );
        return itemRegions[i];
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
    
    function onActiveItems( f ) {
        var i0 = currentPage * pageSize;
        var i;
        for(i = 0; i < pageSize; i++) {
            var region = itemRegions[i0 + i];
            if( region ) {
                f( region );
            }
        }
    }
    
    function numberOfPages() {
        return Math.ceil( itemRegions.length / pageSize );
    }

    function setPage( i ) {
        var n = numberOfPages();
        if( n == 0 ) {
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
        region: region,
        pageRegions: pageRegions,
        setSelected: setSelected,
        nextSelected: nextSelected,
        previousSelected: previousSelected
    };
} };
