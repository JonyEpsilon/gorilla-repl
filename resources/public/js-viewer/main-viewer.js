/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

var app = (function () {

    var self = {};

    self.start = function (worksheetData, sourceURL, worksheetName, source) {

        var ws = worksheet();
        ws.segments = ko.observableArray(worksheetParser.parse(worksheetData));
        var wsWrapper = worksheetWrapper(ws);
        wsWrapper.sourceURL(sourceURL);
        wsWrapper.filename(worksheetName);
        wsWrapper.source(source);
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
            getFromGithub(user, repo, path, function (data) {
                app.start(data, "https://github.com/" + user + "/" + repo, path, source);
            });
            return;
        case "gist":
            var id = getParameterByName("id");
            var filename = getParameterByName("filename");
            getFromGist(id, filename, function (data) {
                app.start(data,  "https://gist.github.com/" + id, filename, source);
            });
            return;
        case "test":
            // so you can test without exhausting the github API limit
            $.get('/test.clj').success(function (data) {
                app.start(data, "http://gorilla-repl.org/", "test.clj", source);
            });
    }
});