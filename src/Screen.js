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

    function draw() {
        if( scene ) {
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
        scene = newScene;
    }
        
    function destroy() {
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

    return {
        setScene: setScene,
        destroy: destroy,
        mouse: getMouse,
        canvas: getCanvas
    };
} };

module.exports = Screen;
