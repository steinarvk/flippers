var buster = require("buster");

var Hooks = require("../src/Hooks");

buster.testCase( "Hooks", {
    "simple": function() {
        var h = Hooks.create(),
            l = [ 0, 0, 0 ],
            f = null;

        h.add( "alpha", function() {
            l[0] += 1;
        } );

        h.add( "beta", function() {
            l[1] += 1;
        } );

        h.add( "gamma", function() {
            l[2] += 1;
        } );

        h.add( "variable", function(i) {
            l[i] += 1;
        } );

        buster.assert.equals( l, [ 0, 0, 0 ] );

        h.run( "alpha" );

        buster.assert.equals( l, [ 1, 0, 0 ] );

        h.run( "beta" );
        h.run( "beta" );

        buster.assert.equals( l, [ 1, 2, 0 ] );

        h.run( "gamma" );

        buster.assert.equals( l, [ 1, 2, 1 ] );

        h.run( "variable", 0 );

        buster.assert.equals( l, [ 2, 2, 1 ] );

        function otherGamma() {
            l[2] += 3;
        }

        h.add( "gamma", otherGamma );
        f = h.add( "gamma", otherGamma );

        h.run( "gamma" );

        buster.assert.equals( l, [ 2, 2, 8 ] );
        
        f();

        h.run( "gamma" );

        buster.assert.equals( l, [ 2, 2, 12 ] );
    }
} );
