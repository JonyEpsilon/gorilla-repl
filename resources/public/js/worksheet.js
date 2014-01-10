/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// ** The worksheet wrapper **

// The main view model is wrapped in a wrapper. It has a few functions:
// 1) It allows loading of worksheets to be done gracefully. (KO doesn't like to unbind from
// a model, so we can't load a new model and just bind KO to it. But we can bind
// KO to this wrapper and then just change the wrapped model without changing KO's bindings.)
// 2) It keeps some metadata that is needed for communicating with the backend, but doesn't really belong in the
// worksheet
// 3) It handles the other UI elements that aren't part of the worksheet.

var worksheetWrapper = function (worksheet) {
    var self = {};

    // this ID is used to identify the worksheet to the server
    self.id = ko.observable();
    self.worksheet = ko.observable(worksheet);

    // * UI state *
    self.saveStatus = ko.observable('Ready.');

    // the worksheet gets a reference to its wrapper
    worksheet.wrapper = self;

    return self;
};


// ** The worksheet **

// this viewmodel represents the worksheet document itself.
var worksheet = function () {
    var self = {};

    // this is the root segment of the document. It has no parent, and a link to this worksheet.
    self.segments = ko.observable([]);

    // these getModel functions return a representation of the model suitable for serialization.
    self.getModel = function () {
        return {
            segments: self.segments.getModel()
        };
    };
    // and a convenience function to serialize
    self.serialize = function () {
        return JSON.stringify(self.getModel());
    };

    return self;
};
