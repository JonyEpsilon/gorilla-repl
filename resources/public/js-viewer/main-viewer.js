/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */


// ** The worksheet wrapper **

// The main view model is wrapped in a wrapper. It exists mainly for historical reasons. It handles the UI elements that
// aren't really part of the worksheet (status etc), and contains info related to the server-side (like filename).

var worksheetWrapper = function (worksheet) {
    var self = {};

    self.worksheet = ko.observable(worksheet);

    // the filename that the worksheet corresponds to, if the worksheet was not loaded, or has never been saved,
    // this will be the empty string.
    self.filename = ko.observable("");
    self.title = ko.computed(function () {
        if (self.filename() === "") return "Gorilla REPL viewer";
        else return "Gorilla REPL viewer: " + self.filename();
    });
    self.sourceURL = ko.observable("");
    self.source = ko.observable("");

    // status indicator
    self.status = ko.observable("");
    // A message queue could be useful here, although I'm not sure it'll ever come up in practice.
    self.flashStatusMessage = function (message, displayMillis) {
        var millis = displayMillis ? displayMillis : 700;
        self.status(message);
        setTimeout(function () {self.status("");}, millis);
    };

    self.copyBoxVisible = ko.observable(false);
    self.showCopyBox = function () {
        self.copyBoxVisible(true);
    };
    self.hideCopyBox = function () {
        self.copyBoxVisible(false);
    };

    return self;
};

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