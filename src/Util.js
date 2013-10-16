function arrayRemoveElement( ar, element ) {
    var i = ar.indexOf( element );
    if( i > -1 ) {
	ar.splice( i, 1 );
    }
}

function endsWith( s, suffix ) {
    return s.indexOf( suffix, s.length - suffix.length ) !== -1;
}

function rectCenter( rect ) {
    return {x: rect.x + 0.5 * rect.width,
            y: rect.y + 0.5 * rect.height};
}

function rectRadius( rect ) {
    return Math.min( 0.5 * rect.width, 0.5 * rect.height );
}

module.exports = {
    arrayRemoveElement: arrayRemoveElement,
    endsWith: endsWith,
    rectCenter: rectCenter,
    rectRadius: rectRadius
}
