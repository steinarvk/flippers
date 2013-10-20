"use strict";

/*jslint browser: true */

var BrowserUtil = (function() {
    function isLocal() {
        if( window.location.protocol === "file:" ) {
            return true;
        }
        if( window.location.host.indexOf( "localhost" ) !== -1 ) {
            return true;
        }
        return false;
    }

    return {
        isLocal: isLocal
    };
}());

module.exports = BrowserUtil;
