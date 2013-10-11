var AABB = require("./AABB");
var DiagramGraphics = require("./DiagramGraphics");
var GameState = require("./GameState");
var SmoothGameState = require("./SmoothGameState");
var Inventory = require("./Inventory");
var Mouse = require("./Mouse");
var Regions = require("./Regions");
var PredefinedLevels = require("./PredefinedLevels");
var Menu = require("./Menu");
var Screen = require("./Screen");
var Picture = require("./Picture");
var Sound = require("./Sound");
var Stopwatch = require("./Stopwatch");
var GridMenu = require("./GridMenu");
var Map2D = require("./Map2D");
var Icon = require("./Icon");

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

    var dropdown = $( "<select/>", {id: "predefinedLevelSelector"} );
    for(var name in PredefinedLevels) {
	$( "<option/>", {value: name,
			 text: name} ).appendTo( dropdown );
    }

    $("#flippersGame")
	.append( $(document.createElement("br")) )
	.append( $(document.createElement("button"))
		 .attr( "id", "startstopbutton" )
		 .html( "Start" ) )
	.append( $(document.createElement("textarea"))
		 .attr( "id", "leveldata" ) )
	.append( $(document.createElement("button"))
		 .attr( "id", "savebutton" )
		 .html( "Save" ) )
	.append( $(document.createElement("button"))
		 .attr( "id", "loadbutton" )
		 .html( "Load" ) )
	.append( dropdown )
	.append( $("<button/>")
                 .attr( "id", "loadpredefinedbutton" )
		 .html( "Load predefined" ) );

    var screen = Screen.create( canvas );

    screen.setScene( makePregameMenu( screen, 1 ) );
}

function makeLevelActivator( f, level ) {
    return function() { f( level ); }
}

function makeLevelSelectMenu( screen, levels, onLevel ) {
    var selections = [];
    for(var label in levels) {
        selections.push( {text: label,
                          activate: makeLevelActivator( onLevel, levels[label] )} );
    }
    return GridMenu.create(
        screen.canvas(),
        screen.area(),
        {cols: 6, rows: 10},
        selections,
        screen.mouse()
    );
}

function makePregameMenu( screen, n ) {
    return Menu.create(
        screen.canvas(),
        {x: 0, y: 0, width: 480, height: 800},
        [
            {text: "Puzzle",
             activate: function() {
                 screen.setScene( makeLevelSelectMenu(
                     screen,
                     PredefinedLevels,
                     function(level) {
                         screen.setScene( makeGame( screen, level ) );
                     }
                 ) )
             } },
            {text: "Freeform",
             activate: function() {
                 screen.setScene( makeGame( screen, null ) );
             }},
            {text: "Test " + n,
             activate: function() {
                 screen.setScene( makePregameMenu( screen, n + 1 ) );
             }},
            {text: "Picture",
             activate: function() {
                 screen.setScene( makeMediaScene( screen ) );
             }},
            {text: "Html",
             activate: function() {
                 screen.setScene( makeHtmlScene( screen ) );
             }}
        ],
        screen.mouse() );
}

function makeHtmlScene( screen ) {
    var x = $(document.createElement("div"))
            .html("Hello world!")
            .css( "width", "200px" )
            .css( "left", "140px" )
            .css( "top", "600px" )
            .css( "height", "3em" )
            .css( "text-align", "center" )
            .css( "position", "fixed" )
            .css( "pointer-events", "none" )
            .css( "background-color", "magenta" )
            .appendTo( "#flippersGame" );

    x.css( "-webkit-animation", "mymovein 2s ease-out" );
//    x.css( "-webkit-animation-fill-mode", "forwards" );
//    Doesn't work on Android

    setTimeout( function() {
        console.log( "setting aimation" );
        x.css( "-webkit-animation", "mymoveout 1s ease-in" );
        x.css( "opacity", "0.0" );
    }, 5000 );

    var flag = false;

    setTimeout( function() {
        screen.setScene( makePregameMenu( screen, -5 ) );
    }, 10000 );
    return {
        mouseHandler: function(click) {
            if( flag ) {
                x.css( "background-color", "yellow" );
            } else {
                x.css( "background-color", "blue" );
            }
            flag = !flag;
        },
        exit: function() {
            x.remove();
        }
    }
}

function makeMediaScene( screen ) {
    var t = 20000;
    setTimeout( function() {
        screen.setScene( makePregameMenu( screen, 1 ) );
    }, t );
    var pics = Picture.load( { my: "./test.png" } ).pictures;
    var ctx = screen.canvas().getContext("2d");
//    Sound.load( { my: "./impactStone.ogg" }, function(rv) {
//        rv.sounds.my.play();
//    } );
    var sw = Stopwatch.create();
    var h = screen.canvas().height / t;
    var last = null;
    return {
        draw: function() {
            if( pics.my ) {
                var x = Math.floor( sw.ms() * h );
                ctx.drawImage( pics.my, 0, x );
            }
        }
    }
}

function makeGame( screen, presetPuzzle ) {
    var canvas = screen.canvas();
    var jqcanvas = $(canvas);
    var ctx = canvas.getContext("2d");
    var pics = Picture.load( {
        back: "./assets/symbols_back.png",
        left: "./assets/symbols_left.png",
        right: "./assets/symbols_right.png",
        play: "./assets/symbols_play.png",
        clear: "./assets/symbols_clear.png"
    } ).pictures;

    var myState = null;

    if( presetPuzzle ) {
        myState = GameState.load( presetPuzzle );
    } else {
        myState = GameState.loadOld(
	    {"rows":7,"cols":7,"contents":[]}
        );
    }

    var buildMode = !presetPuzzle;
    var presetGame = null;

    var gamegraphics = DiagramGraphics.create( canvas,
					      {x: 0,
					       y: 0,
					       width: 480,
					       height: 480},
					      {cols: 9,
					       rows: 9}
					    );
    if( !buildMode ) {
        presetGame = GameState.load( presetPuzzle );
        var shade = Map2D.create();
        presetGame.onSquares( function( cell, element ) {
            if( element ) {
                shade.set( cell.col, cell.row, true );
            }
        } );
        gamegraphics.setBoardShading( shade );
    }

    var mySmoothState = null;
    var mySavedState = null;

    $("#startstopbutton").click( toggleGame );
    $("#savebutton").click( function() {
	$("#leveldata").val( saveLevel() );
    } );
    $("#loadbutton").click( function() {
        if( !buildMode ) {
            return;
        }
	var data = $("#leveldata").val();
	console.log( "loading " + data );
	loadLevel( data );
    } );
    $("#loadpredefinedbutton").click( function() {
        if( !buildMode ) {
            return;
        }

	var key = $("#predefinedLevelSelector").val();
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
    } );

    if( !buildMode ) {
        $("#loadbutton").prop("disabled", true);
        $("#loadpredefinedbutton").prop("disabled", true);
    }
		 
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
        if( !buildMode ) {
            return;
        }

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
    var backButtonSection = controlsSubsections[3];

    var inventory = null;
    var revInvMap = Map2D.create();

    if( presetPuzzle ) {
        inventory = Inventory.create(
            function(region) {
                if( region == null || region.blank ) {
                    currentBrush = null;
                } else {
                    currentBrush = region;
                }
            },
            inventorySection,
            {cols: 3, rows: 2},
            {margins: 2}
        );
        for(var i = 0; i < presetPuzzle.inventory.length; i++) {
            var item = presetPuzzle.inventory[i];
            console.log( "adding " + JSON.stringify( item ) );
            inventory.add( item );
        }
    } else {
        // Add full post-scarcity palette
        (function () {
            inventory = Inventory.create(
                function(region) {
                    if( region == null ) {
                        currentBrush = null;
                    } else {
                        currentBrush = region;
                    }
                },
                inventorySection,
                {cols: 3,
                 rows: 2},
                {margins: 2} );
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
    }

    function configureElement( element ) {
        if( element.rotation !== undefined ) {
            element.rotation = (element.rotation + 1) % 4;
        } else if( element.ascending !== undefined ) {
            element.ascending = !element.ascending;
        }
        return element;
    }

    function cellIsFixed( cell ) {
        if( buildMode ) {
            return false;
        }

        if( presetGame.elementAtCell( cell ) ) {
            return true;
        }

        return false;
    }

    buttonregions.add( Icon.create(
        playButtonSection,
        pics,
        "play",
        { tap: toggleGame },
        { maxfill: 0.75 }
    ) );

    if( buildMode ) {
        buttonregions.add( Icon.create(
            clearButtonSection,
            pics,
            "clear",
            { tap: clearGame },
            { maxfill: 0.75 }
        ) );
    }

    buttonregions.add( Icon.create(
        backButtonSection,
        pics,
        "back",
        {
            tap: function() {
                screen.setScene( makePregameMenu( screen, 100 ) );
            } 
        },
        { maxfill: 0.75 }
    ) );

    if( inventory.numberOfPages() > 1 ) {
        buttonregions.add( Icon.create(
            previousInventoryPageButton,
            pics,
            "left",
            { tap: inventory.previousPage },
            { maxfill: 0.75 }
        ) );
        
        buttonregions.add( Icon.create(
            nextInventoryPageButton,
            pics,
            "right",
            { tap: inventory.nextPage },
            { maxfill: 0.75 }
        ) );
    }

    function mouseHandler( click ) {
        var buttonregion = buttonregions.at( click );
        if( buttonregion ) {
            if( buttonregion.mouseHandler ) {
                return buttonregion.mouseHandler( click );
            } else {
                return {tap: buttonregion.handler};
            }
        }
        
        if( inventory.region().contains( click ) ) {
            var subregion = inventory.pageRegions().at( click );
            if( subregion ) {
                return {
                    tap: function() {
                        if( currentBrush && currentBrush.item == subregion.item ) {
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

                if( cellIsFixed( cell ) ) {
                    return;
                }
                var region = revInvMap.get( cell.col, cell.row );
                if( region ) {
                    region.blank = false;
                }

                revInvMap.remove( cell.col, cell.row );
                
		myState.removeElementAtCell( cell );
	    },
	    tap: function( m ) {
                attemptMutation();

                if( cellIsFixed( cell ) ) {
                    return;
                }
                
                var element = myState.elementAtCell( cell );
                if( element ) {
                    myState.setElement( configureElement( element ) );
                } else if( currentBrush && !currentBrush.blank ) {
                    if( presetPuzzle ) {
                        revInvMap.set( cell.col, cell.row, currentBrush );
                        currentBrush.blank = true;
                    }
                    myState.setElement( $.extend( {}, cell, currentBrush.item ) );
                }
	    }
	};
    }

    function render( gfx ) {
	if( mySmoothState ) {
	    mySmoothState.render( gfx );
	} else {
	    myState.render( gfx );
	}

        inventory.render( gfx );

        buttonregions.onRegions( function( region ) {
            if( region.draw ) {
                region.draw( ctx );
            } else {
                gfx.drawColouredAABB( region, region.colour );
            }
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
    
    return {
        draw: function() {
            if( mySmoothState ) {
                mySmoothState.catchup();
            }
	    render( gamegraphics );
        },
        mouseHandler: mouseHandler
    };
}


module.exports.initialize = initialize;
