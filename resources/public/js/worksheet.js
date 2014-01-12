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

// this viewmodel represents the worksheet document itself. Code to manage the "cursor" that is, the highlight on the
// active segment, and the position of the editor cursors, is in the worksheet, as it needs to know about the
// relationship between the segments.
var worksheet = function () {
    var self = {};

    // the content of the worksheet is a list of segments.
    self.segments = ko.observableArray();

    // ** Segment management **

    self.segmentIndexForID = function (id) {
        // so, this is not perhaps the most efficient way you could think of doing this, but for reasonable conditions
        // it will be fine.
        for (var i = 0; i < self.segments().length; i++) {
            if (self.segments()[i].id == id) return i;
        }
        // this had better never happen!
        return -1;
    };

    self.activeSegmentIndex = null;

    self.activateSegment = function (index, fromTop) {
        self.segments()[index].activate(fromTop);
        self.activeSegmentIndex = index;
    };

    self.deactivateSegment = function (index) {
        self.segments()[index].deactivate();
        self.activeSegmentIndex = null;
    };

    self.deleteSegment = function (index) {
        self.segments.splice(index, 1);
        // after deletion, should activate segment before, unless it was the first segment, or there are no segments
        // remaining.
        if (self.segments().length == 0) return;
        if (index == 0) self.activateSegment(0, true);
        else self.activateSegment(index - 1, false);
    };

    // ** Event handlers **

    // activation/deactivation and focusing of segments.
    eventBus.on("segment:leaveForward", function(e, d) {
        var leavingIndex = self.segmentIndexForID(d.id);
        // can't leave the bottom segment forwards
        if (leavingIndex == self.segments().length - 1) return;
        self.deactivateSegment(leavingIndex);
        self.activateSegment(leavingIndex + 1, true);
    });

    eventBus.on("segment:leaveBack", function(e, d) {
        var leavingIndex = self.segmentIndexForID(d.id);
        // can't leave the top segment upwards
        if (leavingIndex == 0) return;
        self.deactivateSegment(leavingIndex);
        self.activateSegment(leavingIndex - 1, false);
    });

    eventBus.on("segment:focus", function(e, d) {
        if (self.activeSegmentIndex != null) self.deactivateSegment(self.activeSegmentIndex);
        var focusIndex = self.segmentIndexForID(d.id);
        self.activateSegment(focusIndex, true);
    });

    eventBus.on("segment:delete", function(e, d) {
        // if there's only one segment, don't delete it
        if (self.segments().length == 1) return;
        var deleteIndex = self.segmentIndexForID(d.id);
        self.deleteSegment(deleteIndex);
    });

    // Note that this is handled globally, so no reference to the currently selected segment is contained in the event.
    eventBus.on("segment:newBelow", function () {
        // do nothing if no segment is active
        if (self.activeSegmentIndex == null) return;
        var seg = codeSegment("new", 785);
        self.segments.splice(self.activeSegmentIndex + 1, 0, seg);
        self.activateSegment(self.activeSegmentIndex + 1);
    });

    return self;
};
