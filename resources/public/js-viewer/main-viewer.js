/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

var app = (function () {

    var self = {};

    self.start = function (worksheetData) {

        var ws = worksheet();
        ws.segments = ko.observableArray(worksheetParser.parse(worksheetData));
        var wsWrapper = worksheetWrapper(ws);
        self.wrapper = wsWrapper;

        // wire up the UI
        ko.applyBindings(wsWrapper, document.getElementById("document"));

        // we only use CodeMirror to syntax highlight the code in the viewer
        CodeMirror.colorize($("pre.static-code"), "text/x-clojure");

    };

    return self;
})();

var getParameterByName = function (name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
};

// The application entry point
$(function () {
    // how are we getting the worksheet data?
    var source = getParameterByName("source");
    switch (source) {
        case "github":
            var user = getParameterByName("user");
            var repo = getParameterByName("repo");
            var path = getParameterByName("path");
            getFromGithub(user, repo, path, app.start);
            return;
        case "gist":
            var id = getParameterByName("id");
            var filename = getParameterByName("filename");
            getFromGist(id, filename, app.start);
            return;
    }
});