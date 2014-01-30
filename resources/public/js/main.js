/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

var app = (function () {

    var self = {};

    // start the app. First of all, the client will call an HTML endpoint on the server to get configuration
    // information. Then the worksheet object is constructed, either from data in the configuration reply, or using
    // default content, and bound to the UI.
    self.start = function () {

        // load the configuration from the server
        $.get("/config",
            function (data) {
                // start the REPL - the app is started in a callback from the repl connection that indicates we are
                // successfully connected.
                repl.connect(
                    function () {
                        var ws;
                        if (data["worksheet-data"]) {
                            var segments = worksheetParser.parse(data["worksheet-data"]);
                            ws = worksheet();
                            ws.segments = ko.observableArray(segments);
                        }
                        else {
                            // prepare a skeleton worksheet
                            ws = worksheet();
                            ws.segments().push(freeSegment("# Gorilla REPL\n\nWelcome to gorilla ..."));
                            ws.segments().push(codeSegment(""));
                        }
                        var wsWrapper = worksheetWrapper(ws);
                        self.wrapper = wsWrapper;

                        if (data["worksheet-filename"]) wsWrapper.filename = data["worksheet-filename"];

                        ko.applyBindings(wsWrapper);
                    },
                    // this function is called if we failed to make a REPL connection. We can't really go any further.
                    function () {
                        alert("Failed to make initial connection to nREPL server. Refreshing the page might help.");
                    });
            })
    };

    // respond to save events
    eventBus.on("app:save", function () {
        $.post("/save");
    });

    return self;
})();

// The application entry point
$(function () {
    app.start();
});