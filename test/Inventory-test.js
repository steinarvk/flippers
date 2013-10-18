var buster = require("buster");

var Inventory = require( "../src/Inventory" );

buster.testCase( "Inventory", {
    "basic": function() {
        var inv = Inventory.create( onSelection,
                                    {x: 0, y: 0, width: 200, height: 200},
                                    {cols: 2, rows: 4} ),
            currentSelection = null,
            i;
        function onSelection( region ) {
            if( region ) {
                currentSelection = region.item;
            } else {
                currentSelection = null;
            }
        }
        inv.add( "foo" );
        buster.assert.equals( inv.numberOfPages(), 1 );
        for(i = 0; i < 7; i++) {
            inv.add( "foo" + i );
            buster.assert.equals( inv.numberOfPages(), 1 );
        }
        inv.add( "bar" );
        buster.assert.equals( inv.numberOfPages(), 2 );
        inv.nextSelected();
        buster.assert.equals( currentSelection, "foo" );
        for(i = 0; i < 7; i++) {
            inv.nextSelected();
            buster.assert.equals( currentSelection, "foo" + i );
        }
        inv.nextSelected();
        buster.assert.equals( currentSelection, "bar" );
        inv.nextSelected();
        buster.assert.equals( currentSelection, "foo" );
        inv.previousSelected();
        buster.assert.equals( currentSelection, "bar" );
    }
} );
