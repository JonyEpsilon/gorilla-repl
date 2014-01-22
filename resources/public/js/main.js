/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

var app = (function () {

    var self = {};

    // start the app with a default worksheet
    self.start = function (initialWorksheetString) {
        // start the REPL
        repl.connect();

        var ws;
        if (initialWorksheetString) {
            var segments = worksheetParser.parse(initialWorksheetString);
            ws = worksheet();
            ws.segments = ko.observableArray(segments);
            self.wrapper.worksheet(ws);
        }
        else {
            // prepare a skeleton worksheet
            ws = worksheet();
            ws.segments().push(freeSegment("# Gorilla REPL\n\nWelcome to gorilla ..."));
            ws.segments().push(codeSegment(""));
        }
        var wsWrapper = worksheetWrapper(ws);
        self.wrapper = wsWrapper;

        ko.applyBindings(wsWrapper);
    };

    return self;
})();

// The application entry point
$(function () {
    app.start();
});