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


// ** The worksheet **

// this viewmodel represents the worksheet document itself. Code to manage the "cursor" that is, the highlight on the
// active segment, and the position of the editor cursors, is in the worksheet, as it needs to know about the
// relationship between the segments.
var worksheet = function () {
    var self = {};

    // the content of the worksheet is a list of segments.
    self.segments = ko.observableArray();

    return self;
};