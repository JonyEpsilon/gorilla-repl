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

        // start the REPL - the app is started in a callback from the repl connection that indicates we are
        // successfully connected.
        repl.connect(
            function () {
                // prepare a skeleton worksheet
                var ws = worksheet();
                ws.segments().push(
                    freeSegment("# Gorilla REPL\n\nWelcome to gorilla. Shift + enter evaluates code.")
                );
                ws.segments().push(codeSegment(""));
                var wsWrapper = worksheetWrapper(ws);
                self.wrapper = wsWrapper;

                // wire up the UI
                ko.applyBindings(wsWrapper);

                // make it easier for the user to get started by highlighting the empty code segment
                eventBus.trigger("worksheet:segment-clicked", {id: ws.segments()[1].id});
            },
            // this function is called if we failed to make a REPL connection. We can't really go any further.
            function () {
                alert("Failed to make initial connection to nREPL server. Refreshing the page might help.");
            });
    };

    // A helper function for prompting with a modal dialog
    var prompt = function (message, cb) {
        Mousetrap.enable(false);
        vex.dialog.prompt({
            message: message,
            className: 'vex-theme-plain', // yuck
            callback: function (filename) {
                Mousetrap.enable(true);
                cb(filename);
            }
        });
    };

    // ** Application event handlers

    eventBus.on("app:load", function () {
        prompt(
            'Worksheet to load (relative to worksheet directory)?',
            function (filename) {
                // if the user selected a worksheet
                if (filename) {
                    // ask the backend to load the data from disk
                    $.get("/load", {"worksheet-filename": filename}, function (data) {
                        if (data['worksheet-data']) {
                            // disconnect the old worksheet
                            self.wrapper.worksheet().removeEventHandlers();

                            // parse the new worksheet
                            var segments = worksheetParser.parse(data["worksheet-data"]);
                            var ws = worksheet();
                            ws.segments = ko.observableArray(segments);

                            // and bind the UI to the new worksheet
                            self.wrapper.worksheet(ws);
                        }
                    });
                }
            }
        );
    });

    eventBus.on("app:save", function () {
        $.post("/save", {"worksheet-data": self.wrapper.worksheet().toClojure()});
    });

    return self;
})();

// The application entry point
$(function () {
    app.start();
});