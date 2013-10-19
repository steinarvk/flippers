"use strict";

module.exports = (function() {
    function create() {
        var m = {};

        function set( i, j, data ) {
            var is = i.toString(),
                js = j.toString(),
                submap = m[ is ];
            if( !submap ) {
                submap  = m[ is ] = {};
            }
            submap[ js ] = data;
        }

        function remove( i, j ) {
            var is = i.toString(),
                js = j.toString(),
                submap = m[ is ];
            if( !submap ) {
                return;
            }
            delete submap[js];
        }

        function get( i, j ) {
            var is = i.toString(),
                js = j.toString(),
                submap = m[ is ];
            if( !submap ) {
                return undefined;
            }
            return submap[js];
        }

        function adjust( i, j, f ) {
            set(i, j, f( get( i, j ) ) );
        }

        function save() {
            var rv = [],
                i, j, is, js;
            for(is in m) {
                if( m.hasOwnProperty(is) ) {
                    i = parseInt( is, 10 );
                    for(js in m[is]) {
                        if( m[is].hasOwnProperty(js) ) {
                            j = parseInt( js, 10 );
                            rv.push( [i, j, m[is][js]] );
                        }
                    }
                }
            }
            return rv;
        }
        
        function count() {
            return save().length;
        }

        return {
            set: set,
            remove: remove,
            get: get,
            count: count,
            adjust: adjust,
            save: save
        };
    }

    function load( data ) {
        var m = create(),
            index, i, j, v;
        for(index = 0; index < data.length; index++) {
            i = data[index][0];
            j = data[index][1];
            v = data[index][2];
            m.set( i, j, v );
        }
        return m;
    }

    return {
        create: create,
        load: load
    };
}());
