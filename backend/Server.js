var sys = require("sys");
var http = require("http");

var port = 5900;

var state = [];

function couchPost( doc, cont ) {
    cont( "not yet implemented", null );
}

function couchView( viewName, args, cont ) {
    cont( null, "not yet implemented" );
}

function handleGetPuzzleById( finish, puzzleId ) {
    if( !puzzleId.match( /^[0-9a-f]+$/ ) ) {
        throw( {message: "invalid puzzle ID" } );
    }
    
    couchView( "puzzlesById",
                  {from: puzzleId,
                   to: puzzleId,
                   limit: 1},
                  function( data, error ) {
                      if( data ) {
                          if( data.rows.length > 0
                              && data.rows[0].key == puzzleId) {
                              finish( {result: data.rows[0].value } );
                          } else {
                              finish( {error: "no match"} );
                          }
                      } else {
                          finish( {error: error} );
                      }
                  } );
}

function handleListPuzzles( finish ) {
    couchView( "puzzlesByName",
                  {limit: 10},
                  function( data, error ) {
                      if( data ) {
                          finish( data );
                      } else {
                          finish( {error: error} );
                      }
                  } );
}

function handleGetPuzzles( finish, url ) {
    if( url.length > 2 ) {
        handleGetPuzzleById( finish, url[1] );
    }

    handleListPuzzles( finish );
}

function handlePostPuzzle( finish, url, data ) {
    couchPost( data,
               function( result, id ) {
                   finish( {result: result,
                            id: id} );
               } );
}

var Handlers = {
    "puzzles": {
        "GET": handleGetPuzzles,
        "POST": handlePostPuzzle
    }
};

var app = http.createServer(function(request, response) {
    response.writeHeader( 200, {"Content-Type": "application/json"} );

    var components = request.url.split("/");
    components.shift();

    var handlerName = components[0];

    var handler = null;

    if( Handlers[ handlerName ] ) {
        handler = Handlers[ handlerName ][ request.method ];
    }

    function finish( data ) {
        response.write( JSON.stringify( data ) );
        response.write( "\n" );
        response.end();
    }

    if( !handler ) {
        finish( { error: "no handler for '" + handlerName + "'" } );
    }
    
    if( request.method == "GET" ) {
        try {
            handler( finish, components );
        }
        catch( err ) {
            finish( { error: err.message } );
        }
    } else if( request.method == "POST" ) {
        var fullData = "";
        request.on("data", function(chunk) {
            fullData += chunk;
        } );
        
        request.on("end", function() {
            try {
                handler( finish, components, JSON.parse( fullData ) );
            }
            catch( err ) {
                finish( { error: err.message } );
            }
        } );
    }

} );

sys.puts( "Listening on port: " + port );

app.listen( port );
