var AABB = require("./AABB");
var DiagramGraphics = require("./DiagramGraphics");
var GameState = require("./GameState");
var SmoothGameState = require("./SmoothGameState");
var Inventory = require("./Inventory");
var Mouse = require("./Mouse");
var Regions = require("./Regions");
var PredefinedLevels = require("./PredefinedLevels");
var Menu = require("./Menu");

function elementDeactivatable( element ) {
    return element.type != "switch";
}

function cycleElement( cell, element ) {
    var newElement = null;

    if( element
	&& !element.deactivated
	&& elementDeactivatable( element ) ) {
	newElement = element;
	newElement.deactivated = true;
    } else if( element && element.rotation ) {
	newElement = element;
	newElement.rotation -= 1;
	newElement.deactivated = false;
    } else if( !element ) {
	newElement = {type: "flipper", col: cell.col, row: cell.row, ascending: true };
    } else if( element.type == "flipper" && element.ascending ) {
	newElement = {type: "flipper", col: cell.col, row: cell.row, ascending: false };
    } else if( element.type == "flipper" && !element.ascending ) {
	newElement = {type: "square", col: cell.col, row: cell.row };
    } else if( element.type == "square" ) {
	newElement = {type: "breakable-square", col: cell.col, row: cell.row };
    } else if( element.type == "breakable-square" ) {
	newElement = {type: "switch", col: cell.col, row: cell.row };
    } else if( element.type == "switch" ) {
	newElement = {type: "triangle", col: cell.col, row: cell.row, rotation: 3 };
    } else if( element.type == "triangle" ) {
	newElement = {type: "breakable-triangle", col: cell.col, row: cell.row, rotation: 3 };
    }

    if( newElement ) {
	return newElement;
    }

    return {type: "flipper", col: element.col, row: element.row, ascending: false };
}

function initialize() {
    var canvasWidth = 480;
    var canvasHeight = 800;

    var canvas = document.createElement( "canvas" );
    canvas.id = "flippersCanvas";
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    $("#flippersGame").append( $(canvas) );

    runPregameMenu();
}

function runPregameMenu() {
    var canvas = document.getElementById( "flippersCanvas" );

    var testMenu = Menu.create(
        canvas,
        {x: 0, y: 0, width: 480, height: 800},
        [
            {text: "Hello",
             activate: function() {
                 cancelEverything();
                 runGame();
             }},
            {text: "World",
             activate: function() {
                 console.log( "World activated" );
             }}
        ] );


    // This is clearly a problem. There should be a
    // single "Screen" and many "Scenes" -- Scene has a draw
    // method, Screen calls it.
    var cancelId = setInterval( function() {
        testMenu.draw()
    }, 1000.0 / 30.0 );

    // Similarly, Screen constructs a single mouse handler
    // and gives the events to the active scene.

    var mouse = Mouse.create(
	canvas,
	{holdDelay: 500},
        testMenu.mouseHandler
    );

    testMenu.setMouse( mouse );

    function cancelEverything() {
        clearInterval( cancelId );
    }
}

function runGame() {
    var canvas = document.getElementById( "flippersCanvas" );
    var jqcanvas = $(canvas);

    var myState = GameState.loadOld(
	{"rows":7,"cols":7,"contents":[]}
    );
    var mySmoothState = null;
    var mySavedState = null;

    function setState( newstate ) {
	myState = newstate;
	mySmoothState = null;
    }

    function startGame() {
       	mySavedState = myState.save();
	myState.start();
	mySmoothState = SmoothGameState.wrap( myState );
	mySmoothState.start();
    }

    function stopGame() {
        if( !running() ) {
            return;
        }
	setState( GameState.load( mySavedState ) );
    }

    function running() {
	return mySmoothState != null;
    }

    function attemptMutation() {
        if( running() ) {
            stopGame();
        }
    }

    function toggleGame() {
	if( running() ) {
	    stopGame();
	} else {
	    startGame();
	}
    }

    function clearGame() {
        stopGame();

        var st = myState.save();
        var minsize = 3;
        var maxsize = 9;

        if( st.elements.length == 0 ) {
            // Cycle through different widths/heights.
            var n = (Math.floor( st.size.cols / 2 ) + 1) * 2 + 1;
            if( n > maxsize ) {
                n = minsize;
            }

            st.size.cols = st.size.rows = n;

            st.origin = st.initialVelocity = st.target = null;
        } else {
            st.elements = [];
        }

        loadLevel( JSON.stringify( st ) );
    }

    function saveLevel() {
	return JSON.stringify( myState.save() );
    }

    function loadLevel( data ) {
	setState( GameState.load( JSON.parse( data ) ) );
    }

    console.log( "Game beginning!");

    var dropdown = $( "<select/>", {id: "predefinedLevelSelector"} );
    for(var name in PredefinedLevels) {
	$( "<option/>", {value: name,
			 text: name} ).appendTo( dropdown );
    }

    $("#flippersGame")
	.append( $(document.createElement("br")) )
	.append( $(document.createElement("button"))
		 .attr( "id", "startstopbutton" )
		 .html( "Start" )
		 .click( toggleGame ) )
	.append( $(document.createElement("textarea"))
		 .attr( "id", "leveldata" ) )
	.append( $(document.createElement("button"))
		 .attr( "id", "savebutton" )
		 .html( "Save" )
		 .click( function() {
		     $("#leveldata").val( saveLevel() );
		 } ) )
	.append( $(document.createElement("button"))
		 .attr( "id", "loadbutton" )
		 .html( "Load" )
		 .click( function() {
		     var data = $("#leveldata").val();
		     console.log( "loading " + data );
		     loadLevel( data );
		 } ) )
	.append( dropdown )
	.append( $("<button/>")
		 .html( "Load predefined" )
		 .click( function() {
		     var key = dropdown.val();
		     var level = PredefinedLevels[ key ];
		     if( !level ) {
			 console.log( "No such level!" );
			 return;
		     }
                     if( level.origin ) {
		         setState( GameState.load( level ) );
                     } else {
                         setState( GameState.loadOld( level ) );
                     }
		 } ) );
		 
    ctx = canvas.getContext( "2d" );
    jqcanvas = $("#flippersCanvas");


    var gamegraphics = DiagramGraphics.create( canvas,
					      {x: 0,
					       y: 0,
					       width: 480,
					       height: 480},
					      {cols: 9,
					       rows: 9}
					    );
    var currentBrush = null;

    var buttonregions = Regions.create();
    var wholeCanvas = AABB.create( {x: 0, y: 0, width: 480, height: 800 } );
    var sections = wholeCanvas.vsplit( [ {fixed: 480},
                                         {share: 1},
                                         {share: 1} ] );
    var inventorySections = sections[1].hsplit( [ {fixed: 100}, {}, {fixed: 100} ] );
    // sure would be nice if we had some pattern matching
    var previousInventoryPageButton = inventorySections[0];
    var inventorySection = inventorySections[1];
    var nextInventoryPageButton = inventorySections[2];
    
    var controlsSection = sections[2];
    var controlsSubsections = controlsSection.hsplit( [ {},
                                                        {},
                                                        {},
                                                        {},
                                                        {},
                                                        {} ] );
    var playButtonSection = controlsSubsections[0];
    var clearButtonSection = controlsSubsections[5];

    var inventory = Inventory.create(
        function(region) {
            if( region == null ) {
                currentBrush = null;
            } else {
                currentBrush = region.item;
            }
        },
        inventorySection,
        {cols: 3,
         rows: 2},
        {margins: 2} );
    (function () {
        var colours = ["red", "green", null];
        var elements = [ {type: "flipper", ascending: true},
                         {type: "breakable-triangle", rotation: 3},
                         {type: "breakable-square"},
                         {type: "triangle", rotation: 3},
                         {type: "square"},
                         {type: "switch"} ];
        
        for(var k = 0; k < 2; k++) {
            for(var i = 0; i < colours.length; i++) {
                for(var j = 0; j < elements.length; j++) {
                    var deactivated = k == 1;
                    if( !colours[i] && elements[j].type == "switch" ) {
                        continue;
                    }
                    if( deactivated &&
                        (!colours[i] || elements[j].type == "switch") ) {
                        continue;
                    }
                    inventory.add( $.extend( {},
                                             elements[j],
                                             {colour: colours[i]},
                                             deactivated ?
                                             {deactivated: true}
                                             :
                                             {} ) );
                }
            }
        }
    })();

    function configureElement( element ) {
        if( element.rotation !== undefined ) {
            element.rotation = (element.rotation + 1) % 4;
        } else if( element.ascending !== undefined ) {
            element.ascending = !element.ascending;
        }
        return element;
    }

    buttonregions.add( $.extend( {handler: function() {
        toggleGame();
    }, colour: "red" }, playButtonSection ) );

    buttonregions.add( $.extend( {handler: function() {
        clearGame();
    }, colour: "purple" }, clearButtonSection ) );

    buttonregions.add( $.extend( {handler: function() {
        inventory.previousPage();
    }, colour: "blue" }, previousInventoryPageButton ) );

    buttonregions.add( $.extend( {handler: function() {
        inventory.nextPage();
    }, colour: "yellow" }, nextInventoryPageButton ) );


    var mouse = Mouse.create(
	canvas,
	{holdDelay: 500},
	function( click ) {
            var buttonregion = buttonregions.at( click );
            if( buttonregion ) {
                return {tap: buttonregion.handler};
            }

            if( inventory.region().contains( click ) ) {
                var subregion = inventory.pageRegions().at( click );
                if( subregion ) {
                    return {
                        tap: function() {
                            if( currentBrush == subregion.item ) {
                                inventory.setSelected( null );
                            } else {
                                inventory.setSelected( subregion );
                            }
                        }
                    };
                }
                return null;
            }

	    var cell = gamegraphics.cellAtPosition( click );
	    if( !cell ) {
		return null;
	    }

	    return {
		hold: function( m ) {
                    attemptMutation();

		    myState.removeElementAtCell( cell );
		},
		tap: function( m ) {
                    attemptMutation();

                    var element = myState.elementAtCell( cell );
                    if( element ) {
                        myState.setElement( configureElement( element ) );
                    } else if( currentBrush ) {
                        myState.setElement( $.extend( {}, cell, currentBrush ) );
                    }
		}
	    };
	}
    );


    function render( gfx ) {
	if( mySmoothState ) {
	    mySmoothState.render( gfx );
	} else {
	    myState.render( gfx );
	}

        inventory.render( gfx );

        buttonregions.onRegions( function( region ) {
            gfx.drawColouredAABB( region, region.colour );
        } );
    }

    var kb = new Kibo();
    kb
        .down( "left", function() {
            inventory.previousSelected();
        } )
        .down( "right", function() {
            inventory.nextSelected();
        } )
        .down( "space", function() {
            toggleGame();
        } );
    
    setInterval( function() {
        if( mySmoothState ) {
            mySmoothState.catchup();
        }
	ctx.clearRect( 0, 0, canvas.width, canvas.height );
	render( gamegraphics );
    }, 1000 / 30.0 );
}


module.exports.initialize = initialize;
