var Paginated = {create: function( requestUrl, result ) {
    console.log( "create paginated" );

    function setResult( newResult ) {
        result = newResult;
    }

    function numberOfPages() {
        return Math.ceil( result.total_rows / result.page_size );
    }

    function validResultGoingBackward( newResult ) {
        return newResult.next_key && newResult.next_id;
    }

    function nextPage( callback ) {
        if( !result.next_key || !result.next_id ) {
            return false;
        }

        var nextUrl = requestUrl
                + "?next_key=" + JSON.stringify( result.next_key )
                + "&next_id=" + result.next_id;

        $.get( nextUrl )
            .done( function(newResult) {
                setResult( newResult );
                callback();
            } );

        return true;
    }

    function prevPage( callback ) {
        if( !result.prev_key || !result.prev_id ) {
            return false;
        }

        var prevUrl = requestUrl
                + "?prev_key=" + JSON.stringify( result.prev_key )
                + "&prev_id=" + result.prev_id;

        $.get( prevUrl )
            .done( function(newResult) {
                if( validResultGoingBackward( newResult ) ) {
                    setResult( newResult );
                    callback();
                }
            } );

        return true;
    }

    function getData() {
        return result.result;
    }


    return {
        next: nextPage,
        prev: prevPage,
        rows: getData
    };
} };

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
            .done( function( result ) {
                console.log( "creating paginated" );
                next( null, Paginated.create( fullUrl, result ) );
            } )
            .fail( function() {
                next( "unable to fetch puzzle list" );
            } );
    }

    function fetchPuzzle( id, next ) {
        var fullUrl = baseUrl + "puzzles?id=" + id;

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
                console.log( "hmm " + JSON.stringify( data ) );
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
