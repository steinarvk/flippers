var buster = require("buster");

var Map2D = require("../src/Map2D");

buster.testCase( "Map2D", {
    "basics": function() {
        var m = Map2D.create();
        m.set( 42, 89, "hello" );
        buster.assert.equals( m.get( 43, 10 ), undefined );
        m.set( 43, 10, "foo" );
        buster.assert.equals( m.get( 42, 89 ), "hello" );
        buster.assert.equals( m.get( 43, 10 ), "foo" );
        m.set( 43, 10, "bar" );
        buster.assert.equals( m.get( 43, 10 ), "bar" );
        m.remove( 43, 10 );
        buster.assert.equals( m.get( 43, 10 ), undefined );
    },
    "delete not present": function() {
        var m = Map2D.create();
        m.set( 42, 89, "hello" );
        buster.assert.equals( m.save().length, 1 );
        m.remove( 42, 90 );
        buster.assert.equals( m.save().length, 1 );
        m.remove( 42, 89 );
        buster.assert.equals( m.save().length, 0 );
        m.remove( 32, 89 );
        buster.assert.equals( m.save().length, 0 );
    },
    "save and load": function() {
        var data = [[1,3,"hello"],
                    [5,1,"woo"],
                    [9,9,"yes"]],
            m = Map2D.load( data ),
            rv = null;
        buster.assert.equals( m.get( 1, 3 ), "hello" );
        buster.assert.equals( m.get( 5, 1 ), "woo" );
        buster.assert.equals( m.get( 9, 9 ), "yes" );
        rv = m.save();
        buster.assert.equals( rv.length, 3 );
    }
} );
