"use strict";

module.exports = (function() {
    function specMin( spec ) {
        if( spec.fixed ) {
            return spec.fixed;
        }
        if( spec.min ) {
            return spec.min;
        }
        return 0;
    }

    function specShare( spec ) {
        if( spec.fixed ) {
            return 0;
        }
        if( spec.share ) {
            return spec.share;
        }
        return 1;
    }

    function sum( x, y ) {
        return x + y;
    }

    function allot( available, specs ) {
        var minimums = specs.map( specMin ),
            total = minimums.reduce( sum ),
            excess = available - total,
            totalShare = specs.map( specShare ).reduce( sum ),
            totalNonminimalShare = specs.map( function( spec ) {
                var proper = available * specShare( spec ) / totalShare,
                    minimal = specMin(spec);
                if( minimal >= proper ) {
                    return 0;
                }
                return specShare( spec );
            } ).reduce( sum ),
            totalMinimalSpace = specs.map( function( spec ) {
                var proper = available * specShare( spec ) / totalShare,
                    minimal = specMin(spec);
                if( minimal >= proper ) {
                    return minimal;
                }
                return 0;
            } ).reduce( sum ),
            realExcess = available - totalMinimalSpace;

        if( excess <= 0 ) {
            return minimums;
        }
        return specs.map( function(spec) {
            var proper = available * specShare( spec ) / totalShare,
                minimal = specMin(spec);
            if( minimal >= proper ) {
                return minimal;
            }
            return realExcess * specShare( spec ) / totalNonminimalShare;
        } );
    }

    return {
        allot: allot
    };
}());
