var Picture = (function() {
    function loadInto( result, name, picture ) {
        var img = new Image();
        img.onload = function() {
            result.pictures[ name ] = img;
            result.remaining--;
        };
        img.src = picture;
    }

    function loadAsync( pictures ) {
        var rv = {remaining: 0,
                  pictures: {}};
        var count = 0;
        for(var key in pictures) {
            rv.remaining++;
        }
        for(var key in pictures) {
            loadInto( rv, key, pictures[key] );
        }
        return rv;
    }

    return {
        load: loadAsync
    };
})();

module.exports = Picture;
