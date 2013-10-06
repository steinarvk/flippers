module.exports = (function() {
    function load( data ) {
	var m = create();
	for(var index = 0; index < data.length; index++) {
	    var i = data[index][0];
	    var j = data[index][1];
	    var v = data[index][2];
	    m.set( i, j, v );
	}
	return m;
    }

    function create() {
	var m = {};

	function set( i, j, data ) {
	    var is = i.toString();
	    var js = j.toString();
	    var submap = m[ is ];
	    if( !submap ) {
		submap  = m[ is ] = {};
	    }
	    submap[ js ] = data;
	}

	function remove( i, j ) {
	    var is = i.toString();
	    var js = j.toString();
	    var submap = m[ is ];
	    if( !submap ) {
		return;
	    }
	    delete submap[js];
	}

	function get( i, j ) {
	    var is = i.toString();
	    var js = j.toString();
	    var submap = m[ is ];
	    if( !submap ) {
		return undefined;
	    }
	    return submap[js];
	}

	function save() {
	    var rv = [];
	    for(var is in m) {
		var i = parseInt( is );
		for(var js in m[is]) {
		    var j = parseInt( js );
		    rv.push( [i, j, m[is][js]] );
		}
	    }
	    return rv;
	}
	
	return {
	    set: set,
	    remove: remove,
	    get: get,
	    save: save
	};
    }

    return {
	create: create,
	load: load
    };
} )();
