var sys = require("sys");
var http = require("http");
var request = require("request");
var querystring = require("querystring");

var port = 5900;

var db = "http://localhost:5984/flippers/";

function jsonRequest( handler ) {
    return function(error, response, body) {
        if( !error
            && response.statusCode >= 200
            && response.statusCode <= 299 ) {
            var data = null;
            try {
                if(typeof body == "object" ) {
                    // For a json POST request the request module does this
                    data = body;
                } else {
                    data = JSON.parse( body );
                }
            }
            catch( err ) {
                handler( "JSON parse error", null );
                return;
            }
            handler( null, data );
        } else {
            if( response && response.statusCode ) {
                if( typeof body == "object" ) {
                    handler( "Error: " + JSON.stringify( body ), null );
                } else if( error ) {
                    handler( "Error: (" + response.statusCode + ") " + error, null );
                } else {
                    handler( "Error: (" + response.statusCode + ")", null );
                }

            } else {
                handler( "Error: (-)" + error, null );
            }
        }
    };
}

function couchPost( doc, cont ) {
    var url = db;
    request( {method: "POST",
               uri: url,
               json: doc},
              jsonRequest( function( error, data ) {
                  if( error ) {
                      cont( error, null );
                  } else {
                      cont( null, data.id );
                  }
              } ) );
}

function couchView( viewName, args, cont ) {
    var base = db + "_design/flippers/_view/" + viewName;
    var url = base + "?" + querystring.stringify( args );
    sys.puts( "mjau: " + url );
    request.get( url, jsonRequest( cont ) );
}

function handleGetPuzzleById( finish, puzzleId ) {
    if( !puzzleId.match( /^[0-9a-f]+$/ ) ) {
        throw( {message: "invalid puzzle ID" } );
    }
    
    couchView( "puzzlesById",
                  {key: JSON.stringify( puzzleId ),
                   limit: 1},
                  function( error, data ) {
                      if( data ) {
                          sys.puts( JSON.stringify( data ) );
                          sys.puts( "wanted " + puzzleId );
                          sys.puts( "got " + data.rows[0].key );
                          sys.puts( "match " + (puzzleId == data.rows[0].key ) );
                          sys.puts( "len " + data.rows.length );
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
                  function( error, data ) {
                      if( data ) {
                          finish( data.rows.map( function( entry ) {
                              return {id: entry.id,
                                      name: entry.key,
                                      author: entry.value.author};
                          } ) );
                      } else {
                          finish( {error: error} );
                      }
                  } );
}

function handleGetPuzzles( finish, url ) {
    if( url.length >= 2 ) {
        handleGetPuzzleById( finish, url[1] );
    } else {
        handleListPuzzles( finish );
    }
}

function handlePostPuzzle( finish, url, data ) {
    couchPost( data,
               function( error, id ) {
                   if( error ) {
                       finish( {error: error} );
                   } else {
                       finish( {id: id} );
                   }
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

    sys.puts( "Request (" + request.method + "): " + request.url );
    
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
