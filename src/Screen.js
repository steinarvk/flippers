var Mouse = require("./Mouse");

var Screen = { create: function( canvas, options ) {
    options = options || {};

    var drawTimerId = null;
    var fps = options.fps || 30;
    var frameDelay = 1000.0 / fps;
    var holdDelay = options.holdDelay || 500;

    var scene = null;

    drawTimerId = setInterval( draw, frameDelay );

    var mouse = Mouse.create( canvas,
                              {holdDelay: holdDelay},
                              onMouse );

    var ctx = canvas.getContext("2d");

    function draw() {
	ctx.clearRect( 0, 0, canvas.width, canvas.height );
        if( scene && scene.draw ) {
            scene.draw();
        }
    }

    function onMouse( click ) {
        if( scene && scene.mouseHandler ) {
            return scene.mouseHandler( click );
        }
        return null;
    }

    function setScene( newScene ) {
        if( scene && scene.exit ) {
            scene.exit();
        }
        scene = newScene;
        if( scene && scene.enter ) {
            scene.enter();
        }
    }
        
    function destroy() {
        setScene( null );

        clearInterval( drawTimerId );
        drawTimerId = null;
        mouse = null;
    }

    function getMouse() {
        return mouse;
    }
    
    function getCanvas() {
        return canvas;
    }

    function getArea() {
        return {x: 0, y: 0, width: canvas.width, height: canvas.height};
    }

    return {
        setScene: setScene,
        destroy: destroy,
        mouse: getMouse,
        area: getArea,
        canvas: getCanvas
    };
} };

module.exports = Screen;
