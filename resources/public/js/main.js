/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

var worksheetWrapper = function (worksheet) {
    var self = {};

    self.worksheet = ko.observable(worksheet);

    // the filename that the worksheet corresponds to, if the worksheet was not loaded, or has never been saved,
    // this will be the empty string.
    self.filename = ko.observable("");
    self.title = ko.computed(function () {
        if (self.filename() === "") return "Gorilla REPL";
        else return "Gorilla REPL : " + self.filename();
    });

    // status indicator
    self.status = ko.observable("");
    // A message queue could be useful here, although I'm not sure it'll ever come up in practice.
    self.flashStatusMessage = function (message, displayMillis) {
        var millis = displayMillis ? displayMillis : 700;
        self.status(message);
        setTimeout(function () {self.status("");}, millis);
    };

    self.showDisconnectionAlert = function () {
        vex.dialog.alert({
            message: "<p>The connection to the server has been lost. This window is now dead! Hit OK to reload the " +
                "browser window once the server is running again.</p>" +
                "<p>In case you didn't manage to save the worksheet, " +
                "the contents are below for your convenience :-)</p>" +
                "<div class='last-chance'><textarea class='last-chance'>" + self.worksheet().toClojure()
                + "</textarea></div>",
            className: 'vex-theme-plain',
            callback: function () {
                location.reload();
            }
        });
    };

    return self;
};


var app = (function () {

    var self = {};

    self.start = function () {

        // start the REPL - the app is started in a callback from the repl connection that indicates we are
        // successfully connected.
        repl.connect(
            function () {
                // prepare a skeleton worksheet
                var ws = worksheet();
                ws.segments().push(
                    freeSegment("# Gorilla REPL\n\nWelcome to gorilla :-) Shift + enter evaluates code. " +
                        "Poke the question mark (top right) to learn more ...")
                );
                ws.segments().push(codeSegment(""));
                var wsWrapper = worksheetWrapper(ws);
                self.wrapper = wsWrapper;

                // wire up the UI
                ko.applyBindings(wsWrapper, document.getElementById("document"));

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
            'Worksheet to load (relative to project directory):',
            function (filename) {
                // if the user selected a worksheet
                if (filename) {
                    // ask the backend to load the data from disk
                    $.get("/load", {"worksheet-filename": filename})
                        .done(function (data) {
                            if (data['worksheet-data']) {
                                // disconnect the worksheet event handlers
                                self.wrapper.worksheet().removeEventHandlers();

                                // parse the new worksheet
                                var segments = worksheetParser.parse(data["worksheet-data"]);
                                var ws = worksheet();
                                ws.segments = ko.observableArray(segments);

                                // store the filename for subsequent saving
                                self.wrapper.filename(filename);

                                // and bind the UI to the new worksheet
                                self.wrapper.worksheet(ws);
                            }
                        })
                        .fail(function () {
                            self.wrapper.flashStatusMessage("Failed to load worksheet: " + filename, 1500);
                        });
                }
            }
        );
    });

    var saveToFile = function (filename, successCallback) {
        $.post("/save", {
            "worksheet-filename": filename,
            "worksheet-data": self.wrapper.worksheet().toClojure()
        }).done(function () {
            self.wrapper.flashStatusMessage("Saved: " + filename);
            if (successCallback) successCallback();
        }).fail(function () {
            self.wrapper.flashStatusMessage("Failed to save worksheet: " + filename, 1500);
        });
    };

    eventBus.on("app:save", function () {
        var filename = self.wrapper.filename();
        // if we already have a filename, save to it. Else, prompt for a name.
        if (filename !== "") {
            saveToFile(filename);
        } else {
            prompt('Filename (relative to project directory):',
            function (filename) {
                if (filename) {
                    saveToFile(filename, function() {
                        // if the save was successful, hold on to the filename.
                        self.wrapper.filename(filename);
                    });
                }
            })
        }
    });

    eventBus.on("app:connection-lost", function () {
        self.wrapper.showDisconnectionAlert();
    });

    return self;
})();

// The application entry point
$(function () {
    app.start();
});