/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// The app keeps track of application level state, and handles UI and interaction that's not part of the worksheet
// itself (things like load/save, commands etc).
var app = function () {
    var self = {};

    // Most importantly, the application has a worksheet! This is exposed so that the UI can bind to it, but note that
    // you should never change the worksheet directly, as this will leave the event handlers in an inconsistent state.
    // Rather you should use the `setWorksheet` function below.
    self.worksheet = ko.observable();
    // the filename that the worksheet corresponds to. If the worksheet was not loaded, or has never been saved,
    // this will be the empty string.
    self.filename = ko.observable("");

    // Use this to change the worksheet being edited. It takes care of hooking/unhooking event handlers as well as
    // changing the worksheet data structure itself.
    self.setWorksheet = function (newWorksheet, newFilename) {
        // disconnect the worksheet event handlers
        if (self.worksheet()) self.worksheet().removeEventHandlers();
        self.filename(newFilename);
        self.worksheet(newWorksheet);
        newWorksheet.addEventHandlers();
    };

    self.start = function () {
        // prepare a skeleton worksheet
        var ws = worksheet();
        ws.segments().push(
            // Note that the variable ck here is defined in commandProcessor.js, and gives the appropriate shortcut key
            // (ctrl or alt) for the platform.
            freeSegment("# Gorilla REPL\n\nWelcome to gorilla :-)\n\nShift + enter evaluates code. " +
                "Hit " + ck + "+g twice in quick succession or click the menu icon (upper-right corner) for more " +
                "commands ...")
        );
        ws.segments().push(codeSegment(""));
        self.setWorksheet(ws, "");

        // start the UI
        ko.applyBindings(self, document.getElementById("document"));

        // make it easier for the user to get started by highlighting the empty code segment
        eventBus.trigger("worksheet:segment-clicked", {id: self.worksheet().segments()[1].id});
    };

    // bound to the window's title
    self.title = ko.computed(function () {
        if (self.filename() === "") return "Gorilla REPL";
        else return "Gorilla REPL : " + self.filename();
    });

    // status indicator - bound to a popover type element in the UI
    self.status = ko.observable("");
    // A message queue could be useful here, although I'm not sure it'll ever come up in practice.
    self.flashStatusMessage = function (message, displayMillis) {
        var millis = displayMillis ? displayMillis : 700;
        self.status(message);
        setTimeout(function () {self.status("");}, millis);
    };

    // The palette UI component. This single palette is reused each time it appears.
    self.palette = palette();

    self.handleMenuClick = function () {
        eventBus.trigger("command:app:commands");
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

    // A helper for saving the worksheet
    var saveToFile = function (filename, successCallback) {
        $.post("/save", {
            "worksheet-filename": filename,
            "worksheet-data": self.worksheet().toClojure()
        }).done(function () {
            self.flashStatusMessage("Saved: " + filename);
            if (successCallback) successCallback();
        }).fail(function () {
            self.flashStatusMessage("Failed to save worksheet: " + filename, 2000);
        });
    };

    var loadFromFile = function (filename) {
        // ask the backend to load the data from disk
        $.get("/load", {"worksheet-filename": filename})
            .done(function (data) {
                if (data['worksheet-data']) {
                    // parse and construct the new worksheet
                    var segments = worksheetParser.parse(data["worksheet-data"]);
                    var ws = worksheet();
                    ws.segments = ko.observableArray(segments);
                    // show it in the editor
                    self.setWorksheet(ws, filename);
                }
            })
            .fail(function () {
                self.flashStatusMessage("Failed to load worksheet: " + filename, 2000);
            });
    };

    // ** Application event handlers

    // The user has summoned the palette with the list of commands
    eventBus.on("app:commands", function () {
        var visibleCommands = commandList.filter(function (x) {return x.showInMenu});
        var paletteCommands = visibleCommands.map(function (c) {
            return {
                desc: '<div class="command">' + c.desc + '</div><div class="command-shortcut">' + c.kb + '</div>',
                text: c.desc,
                action: c.action
            }
        });
        self.palette.show("Choose a command:", paletteCommands);
    });

    eventBus.on("app:load", function () {
        var files = [];
        $.ajax({
            type: "GET",
            url: "/gorilla-files",
            async: false,
            success: function (data) {
                files = data.files;
            }
        });
        var paletteFiles = files.map(function (c) {
            return {
                desc: '<div class="command">' + c + '</div>',
                text: c,
                action: (function () {loadFromFile(c)})
            }
        });
        self.palette.show("Choose a file to load:", paletteFiles);

    });

    eventBus.on("app:save", function () {
        var fname = self.filename();
        // if we already have a filename, save to it. Else, prompt for a name.
        if (fname !== "") {
            saveToFile(fname);
        } else {
            prompt('Filename (relative to project directory):',
            function (fname) {
                if (fname) {
                    saveToFile(fname, function() {
                        // if the save was successful, hold on to the filename.
                        self.filename(fname);
                    });
                }
            })
        }
    });

    eventBus.on("app:connection-lost", function () {
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
    });

    return self;
};

// The application entry point
$(function () {
    // start the REPL - the app is started in a callback from the repl connection that indicates we are
    // successfully connected.
    repl.connect(
        function () {
            var gorilla = app();
            gorilla.start();
            // for debugging. Let's hope nobody else has defined a global variable called gorilla!
            window.gorilla = gorilla;
        },
        // this function is called if we failed to make a REPL connection. We can't really go any further.
        function () {
            alert("Failed to make initial connection to nREPL server. Refreshing the page might help.");
        });
});
