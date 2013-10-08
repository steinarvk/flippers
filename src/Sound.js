var Sound = (function() {
    function loadInto( result, name, sound, onFinish ) {
        var aud = new Audio();
        console.log( "loading audio " + sound );
        // This doesn't trigger. But I'm also reading that I should
        // really be using the Web Audio API (AudioContext and AudioBuffer)
        // rather than the Audio element.
        aud.onloadeddata = function() {
            console.log( "loaded audio " + sound );
            result.sounds[ name ] = aud;
            if( result.remaining == 1 ) {
                onFinish( result );
            }
            result.remaining--;
        }
        aud.src = sound;
    }

    function loadAsync( sounds, onFinish ) {
        var rv = {remaining: 0,
                  sounds: {}};
        var count = 0;
        for(var key in sounds) {
            rv.remaining++;
        }
        for(var key in sounds) {
            loadInto( rv, key, sounds[key], onFinish );
        }
        return rv;
    }

    return {
        load: loadAsync
    };
})();

module.exports = Sound;
