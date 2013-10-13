var Backend = {create: function(baseUrl) {
    // baseUrl needs to be 'local' -- can't be on another host or port.
    // Apache ProxyPassMatch is useful to redirect this to the node
    // server (Server.js), which again provides a layer above the
    // CouchDB server.
    baseUrl = baseUrl || "/flippers-server/";
    
    function fetchPuzzleList( next ) {
        var fullUrl = baseUrl + "puzzles";
        
        console.log( "request " + fullUrl );

        $.get( fullUrl )
            .done( function( data ) {
                next( null, data );
            } )
            .fail( function() {
                next( "unable to fetch puzzle list" );
            } );
    }

    function fetchPuzzle( id, next ) {
        var fullUrl = baseUrl + "puzzles/" + id + "/";

        console.log( "request " + fullUrl );

        $.get( fullUrl )
            .done( function( data ) {
                next( null, data );
            } )
            .fail( function() {
                next( "unable to fetch puzzle" );
            } );
    }

    function postPuzzle( puzzleData, next ) {
        var fullUrl = baseUrl + "puzzles";

        var postData = JSON.stringify( puzzleData );

        $.post( fullUrl, postData )
            .done( function( data ) {
                next( null, data.id );
            } )
            .fail( function() {
                next( "unable to post puzzle" );
            } );
    }

    return {
        fetchPuzzleList: fetchPuzzleList,
        fetchPuzzle: fetchPuzzle,
        postPuzzle: postPuzzle
    };
} };

module.exports = Backend;
