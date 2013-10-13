var sys = require("sys");
var http = require("http");
var request = require("request");
var querystring = require("querystring");
var url = require("url");

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

function finishPaginatedList( finish, pageSize, error, data, reverse, skip ) {
    if( data ) {
        if( !data.total_rows ) {
            finish( {total_rows: 0,
                     result: []} );
            return;
        }
        var total_rows = data.total_rows;
        if( skip > 0 ) {
            data.rows.splice( 0, skip );
        }
        if( reverse ) {
            data.rows.reverse();
        }
        var nextEl = null;
        if( data.rows.length > pageSize ) {
            nextEl = data.rows.pop();
        }
        var firstEl = data.rows[0];
        var rows = data.rows.map( function( entry ) {
            return {id: entry.id,
                    name: entry.key,
                    author: entry.value.author};
        } );
        var rv = {
            total_rows: total_rows,
            page_size: pageSize,
            prev_key: firstEl.key,
            prev_id: firstEl.id,
            result: rows
        };
        if( nextEl ) {
            rv.next_key = nextEl.key;
            rv.next_id = nextEl.id;
        }
        
        finish( rv );
    } else {
        finish( {error: error} );
    }
}

function handleListPuzzlesPrev( finish, pageSize, to_key, to_id ) {
    couchView( "puzzlesByName",
               {limit: pageSize + 1,
                startkey: to_key,
                startkey_docid: to_id,
                descending: true},
               function( error, data ) {
                   finishPaginatedList( finish, pageSize, error, data, true );
               } );
}

function handleListPuzzlesNext( finish, pageSize, from_key, from_id ) {
    couchView( "puzzlesByName",
               {limit: pageSize + 1,
                startkey: from_key,
                startkey_docid: from_id,
                descending: false},
               function( error, data ) {
                   finishPaginatedList( finish, pageSize, error, data, false );
               } );
}

function handleListPuzzles( finish, pageSize ) {
    couchView( "puzzlesByName",
                  {limit: pageSize + 1},
                  function( error, data ) {
                      finishPaginatedList( finish, pageSize, error, data, false );
                   } );
}

function handleGetPuzzles( finish, args ) {
    var pageSize = 10;

    if( args.query.id ) {
        handleGetPuzzleById( finish, args.query.id );
    } else if( args.query.next_key && args.query.next_id ) {
        handleListPuzzlesNext( finish,
                               pageSize,
                               args.query.next_key,
                               args.query.next_id );
    } else if( args.query.prev_id && args.query.prev_id ) {
        handleListPuzzlesPrev( finish,
                               pageSize,
                               args.query.prev_key,
                               args.query.prev_id );
    } else {
        handleListPuzzles( finish,
                           pageSize);
    }
}

function handlePostPuzzle( finish, args, data ) {
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

    var args = url.parse( request.url, true );

    var components = args.pathname.split("/");
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
            handler( finish, args );
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
                handler( finish, args, JSON.parse( fullData ) );
            }
            catch( err ) {
                finish( { error: err.message } );
            }
        } );
    }

} );

sys.puts( "Listening on port: " + port );

app.listen( port );
