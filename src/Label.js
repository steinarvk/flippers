"use strict";

var Label = {create: function( canvas, area, text, options ) {
    var ctx = canvas.getContext("2d"),
        client = null,
        fontStyle = null,
        fontSize = null;

    function setSize( sz ) {
        console.log(" set size " + sz );

        fontSize = sz;
        fontStyle = sz.toString() + "px sans-serif";
    }

    function autoscale() {
        if( fontStyle && client ) {
            return;
        }

        client = { x: area.x + Math.floor( area.width * 0.1 * 0.5 ),
                   y: area.y + Math.floor( area.height * 0.1 * 0.5 ),
                   width: Math.floor( area.width * 0.9 ),
                   height: Math.floor( area.height * 0.9 ) };

        var maxSize = (options && options.maxSize) || 2000,
            high = maxSize,
            low = 1,
            mid, i;

        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        
        function check( sz ) {
            if( sz > client.height ) {
                return false;
            }
            ctx.font = fontStyle = sz.toString() + "px sans-serif";
            var metrics = ctx.measureText( text );
            return (metrics.width < client.width);
        }

        if( !check( low ) ) {
            setSize( low );
        } else {
            for(i = 0; i < 10; i++) {
                mid = Math.floor( (high + low) * 0.5 );

                if( check( mid ) ) {
                    low = mid;
                } else {
                    high = mid;
                }
            }
            setSize( mid );
        }
    }

    function getSize() {
        return fontSize;
    }

    function render() {
        autoscale();

        ctx.font = fontStyle;
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        
        ctx.fillText( text,
                      client.x + client.width * 0.5,
                      client.y,
                      client.width );
    }

    function setText( newText ) {
        text = newText;
        fontStyle = null;
        autoscale();
    }

    autoscale();

    return {
        setText: setText,
        setSize: setSize,
        getSize: getSize,
        render: render
    };
} };

module.exports = Label;
