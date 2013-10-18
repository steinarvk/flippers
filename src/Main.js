var AABB = require("./AABB");
var DiagramGraphics = require("./DiagramGraphics");
var ImageGraphics = require("./ImageGraphics");
var GameState = require("./GameState");
var SmoothGameState = require("./SmoothGameState");
var Inventory = require("./Inventory");
var Mouse = require("./Mouse");
var Regions = require("./Regions");
var PredefinedLevels = require("./PredefinedLevels");
var Menu = require("./Menu");
var Screen = require("./Screen");
var GridMenu = require("./GridMenu");
var Map2D = require("./Map2D");
var Icon = require("./Icon");
var Backend = require("./Backend");
var Label = require("./Label");
var Random = require("./Random");
var Resources = require("./Resources");
var Globals = require("./Globals");

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

    var assetNames = {
        back: "./assets/symbols_back.png",
        left: "./assets/symbols_left.png",
        right: "./assets/symbols_right.png",
        play: "./assets/symbols_play.png",
        stop: "./assets/symbols_stop.png",
        check: "./assets/symbols_check.png",
        clear: "./assets/symbols_clear.png"
    };
    (function() {
        var colours = ["black", "red", "blue", "green"];
        var disabled_suffixes = [ "", "_disabled" ];
        var solidities = [ "hollow", "solid" ];
        var shapes = [ "square", "tri" ];
        for(var coli = 0; coli < colours.length; coli++) {
            var col = colours[coli];
            
            for( var dsi = 0; dsi < disabled_suffixes.length; dsi++) {
                var suffix = disabled_suffixes[ dsi ];
                
                assetNames[ "block_switch_" + col + suffix ] = "./assets/block_" + col + "_switch" + suffix + ".png";
                assetNames[ "block_flipper_" + col + suffix ] = "./assets/block_flipper_" + col +  suffix + ".png";
                
                for(var i = 0; i < shapes.length; i++) {
                    var shape = shapes[i];
                    
                    for(var j = 0; j < solidities.length; j++) {
                        var solidity = solidities[j];
                        var name = "block_" + shape + "_" + col + "_" + solidity + suffix;
                        assetNames[ name ] = "./assets/" + name + ".png";
                    }
                }
                
            }
        }
    })();
    Globals.resources = Resources.create( assetNames );

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
    return function() { f( level ); };
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
        screen.mouse(),
        {back: function() { screen.setScene( makeRoot(screen) ); }}
    );
}



function makeOnlinePuzzleLoader( screen, id ) {
    var backend = Backend.create();

/*
    backend.postPuzzle( {name: "Puzzle 10",
                         type: "puzzle",
                         author: "kaw",
                         puzzle: PredefinedLevels["10"]},
                        function( error, data ) {
                            console.log( "woo " + JSON.stringify( data ) );
                        } );
*/

    backend.fetchPuzzle( id, function( error, puzzle ) {
        if( error || !puzzle || !puzzle.result ) {
            console.log( "failed to fetch puzzle" );
            screen.setScene( makePregameMenu( screen, 89 ) );
            return;
        }

        console.log( JSON.stringify( puzzle ) );

        screen.setScene( makeGame( screen, puzzle.result.puzzle ) );
    } );

    return {};
}

function makeOnlinePuzzlesMenu( screen ) {
    var backend = Backend.create();
    var pics = Globals.resources.store;

    function makeEntry( entry ) {
        return {
            text: entry.name + " (" + entry.author + ")",
            activate: function() {
                screen.setScene( makeOnlinePuzzleLoader( screen,
                                                         entry.id ) );
            }
        };
    }

    function displayResult( error, puzzlespage ) {
        function onPaged() {
            displayResult( null, puzzlespage );
        }

        if( error ) {
            console.log( "failed to fetch puzzle list" );
            screen.setScene( makePregameMenu( screen, 0 ) );
            return;
        }

        var prevEntry = {text: "Previous",
                         activate: function() {
                             puzzlespage.prev( onPaged );
                         }};
        var nextEntry = {text: "Next",
                         activate: function() {
                             puzzlespage.next( onPaged );
                         }};

        var entries = puzzlespage.rows().map( makeEntry );

        var menuEntries = [];
        
        menuEntries = menuEntries.concat( [prevEntry], entries, [nextEntry] );

        screen.setScene( Menu.create(
            screen.canvas(),
            screen.area(),
            menuEntries,
            screen.mouse(),
            {back: function() { screen.setScene( makeRoot(screen) ); }}
        ) );
    }

    backend.fetchPuzzleList( displayResult );

    return {};
}

function makeRoot( screen ) {
    return makePregameMenu( screen, 1 );
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
                 ) );
             } },
            {text: "Freeform",
             activate: function() {
                 screen.setScene( makeGame( screen, null ) );
             }},
            {text: "Online",
             activate: function() {
                 screen.setScene( makeOnlinePuzzlesMenu( screen ) );
             }}
        ],
        screen.mouse(),
        {back: function() { screen.setScene( makeRoot(screen) ); }}
    );
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
    };
}

function makePuzzleSaver( screen, puzzle ) {
    var pics = Globals.resources.store;

    var ctx = screen.canvas().getContext("2d");

    var puzzleName = "Puzzle " + Random.letters(6);
    var puzzleAuthor = "web user";

    var buttonregions = Regions.create();
    var wholeCanvas = AABB.create( screen.area() );
    var sections = wholeCanvas.vsplit( [ {fixed: screen.area().width},
                                         {share: 1},
                                         {share: 1} ] );
    var controlsSection = sections[2];
    var controlsSubsections = controlsSection.hsplit( [ {},
                                                        {},
                                                        {},
                                                        {},
                                                        {},
                                                        {} ] );
    var textSections = sections[1].vsplit( [{}, {}, {}, {}] );
    var labels = [];
    var mkLabel = function( text ) {
        var rv = Label.create( screen.canvas(),
                               textSections[ labels.length ],
                               text,
                               {maxSize: 40} );
        labels.push( rv );
        return rv;
    };

    var authorLabel = mkLabel( puzzleAuthor );
    var nameLabel = mkLabel( puzzleName );
    var dimensionsLabel = mkLabel( "" + puzzle.size.cols + "x" + puzzle.size.rows );
    var inventorySizeLabel = mkLabel( "" );

    buttonregions.add( Icon.create(
        controlsSubsections[0],
        pics,
        "check",
        { tap: onAccept },
        { maxfill: 0.75 }
    ) );

    buttonregions.add( Icon.create(
        controlsSubsections[5],
        pics,
        "back",
        { tap: onBack },
        { maxfill: 0.75 }
    ) );


    var gamegraphics = ImageGraphics.create( screen.canvas(),
                                             Globals.resources.store,
                                             sections[0],
					     {cols: 9,
					      rows: 9}
					   );

    var state = GameState.load( puzzle );
    
    var inventoryCells = [];

    function updateShading() {
        var shade = Map2D.create();
        state.onSquares( function(cell, element) {
            if( element ) {
                shade.set( cell.col, cell.row, true );
            }
        } );
        for(var i = 0; i < inventoryCells.length; i++) {
            shade.set( inventoryCells[i].col,
                       inventoryCells[i].row,
                       false );
        }
        gamegraphics.setBoardShading( shade );
    }

    function onBack() {
        screen.setScene( makeGame( screen, null, state.save() ) );
    }

    function normalizePiece( piece ) {
        piece = JSON.parse( JSON.stringify( piece ) );

        delete piece.col;
        delete piece.row;
        if( piece.ascending ) {
            piece.ascending = false;
        }
        if( piece.rotation ) {
            piece.rotation = 0;
        }
        return piece;
    }

    function onAccept() {
        var st = GameState.load( state.save() );
        var inv = [];
        for(var i = 0; i < inventoryCells.length; i++) {
            var element = st.elementAtCell( inventoryCells[i] );

            inv.push( normalizePiece( element ) );

            st.removeElementAtCell( inventoryCells[i] );
        }

        var puz = st.save();

        puz.inventory = inv;

        var rv = {type: "puzzle",
                  name: puzzleName,
                  author: puzzleAuthor,
                  puzzle: puz};

        var backend = Backend.create();

        backend.postPuzzle( rv,
                            function( error, id ) {
                                if( id ) {
                                    screen.setScene( makeOnlinePuzzleLoader(
                                        screen,
                                        id
                                    ) );
                                } else {
                                    console.log( "Error posting puzzle" );
                                }
                            } );
    }

    function toggleInventoryCell( cell ) {
        var i = 0;
        for(i = 0; i < inventoryCells.length; i++) {
            var c = inventoryCells[i];
            if( c.col == cell.col && c.row == cell.row ) {
                break;
            }
        }
        if( i >= inventoryCells.length ) {
            inventoryCells.push( cell );
        } else {
            inventoryCells.splice( i, 1 );
        }
        updateShading();
        updateInventoryLabel();
    }

    function updateInventoryLabel() {
        inventorySizeLabel.setText( "" + (inventoryCells.length) + " pieces" );
    }

    updateShading();
    updateInventoryLabel();

    return {
        draw: function() {
            state.render( gamegraphics );

            buttonregions.onRegions( function( region ) {
                region.draw( ctx );
            } );

            for( var i in labels ) {
                labels[i].render();
            }
        },

        mouseHandler: function(click) {
            var button = buttonregions.at( click );
            if( button ) {
                return button.mouseHandler( click );
            }

            var cell = gamegraphics.cellAtPosition( click );

            if( cell && state.elementAtCell( cell ) ) {
                return {tap: function() {
                    toggleInventoryCell( cell );
                } };
            }
            
            return null;
        },

        back: onBack
    };
}

function makeGame( screen, presetPuzzle, preloadedPuzzle ) {
    var canvas = screen.canvas();
    var jqcanvas = $(canvas);
    var ctx = canvas.getContext("2d");
    var pics = Globals.resources.store;

    var myState = null;

    if( presetPuzzle ) {
        myState = GameState.load( presetPuzzle );
    } else if( preloadedPuzzle ) {
        myState = GameState.load( preloadedPuzzle );
    } else {
        myState = GameState.loadOld(
	    {"rows":7,"cols":7,"contents":[]}
        );
    }

    var buildMode = !presetPuzzle;
    var presetGame = null;

    var gamegraphics = ImageGraphics.create( canvas,
                                             Globals.resources.store,
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

    var playstopbutton = null;

    function setState( newstate ) {
	myState = newstate;
	mySmoothState = null;
    }

    function startGame() {
       	mySavedState = myState.save();
	myState.start();
	mySmoothState = SmoothGameState.wrap( myState );
	mySmoothState.start();

        playstopbutton.setIcon( "stop" );
    }

    function stopGame() {
        if( !running() ) {
            return;
        }

        playstopbutton.setIcon( "play" );

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
    var saveButtonSection = controlsSubsections[4];

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

    function showSavePuzzleDialog() {
        screen.setScene( makePuzzleSaver( screen, myState.save() ) );
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

    playstopbutton = Icon.create( playButtonSection,
                                  pics,
                                  "play",
                                  { tap: toggleGame },
                                  { maxfill: 0.75 } );
    buttonregions.add( playstopbutton );

    if( buildMode ) {
        buttonregions.add( Icon.create(
            clearButtonSection,
            pics,
            "clear",
            { tap: clearGame },
            { maxfill: 0.75 }
        ) );
    }

    if( buildMode ) {
        buttonregions.add( Icon.create(
            saveButtonSection,
            pics,
            "check",
            {
                tap: function() {
                    showSavePuzzleDialog();
                }
            },
            {maxfill: 0.75}
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
        mouseHandler: mouseHandler,
        back: function() { screen.setScene( makeRoot(screen) ); }
    };
}


module.exports.initialize = initialize;
