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

    self.getSegmentForID = function (id) {
        var index = self.segmentIndexForID(id);
        if (index >= 0) return self.segments()[index];
        else return null;
    };

    self.activeSegmentIndex = null;

    self.getActiveSegment = function () {
        if (self.activeSegmentIndex != null) return self.segments()[self.activeSegmentIndex];
        else return null;
    };

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

    // * Activation cursor / focus handling *

    // activation/deactivation and focusing of segments.
    eventBus.on("worksheet:leaveForward", function() {
        var leavingIndex = self.activeSegmentIndex;
        // can't leave the bottom segment forwards
        if (leavingIndex == self.segments().length - 1) return;
        self.deactivateSegment(leavingIndex);
        self.activateSegment(leavingIndex + 1, true);
    });

    eventBus.on("worksheet:leaveBack", function() {
        var leavingIndex = self.activeSegmentIndex;
        // can't leave the top segment upwards
        if (leavingIndex == 0) return;
        self.deactivateSegment(leavingIndex);
        self.activateSegment(leavingIndex - 1, false);
    });

    eventBus.on("worksheet:delete", function() {
        // if there's only one segment, don't delete it
        if (self.segments().length == 1) return;
        var deleteIndex = self.activeSegmentIndex;
        self.deleteSegment(deleteIndex);
    });

    // Note that this is handled globally, so no reference to the currently selected segment is contained in the event.
    eventBus.on("worksheet:newBelow", function () {
        // do nothing if no segment is active
        if (self.activeSegmentIndex == null) return;
        var seg = codeSegment("");
        var currentIndex = self.activeSegmentIndex;
        self.deactivateSegment(currentIndex);
        self.segments.splice(currentIndex + 1, 0, seg);
        self.activateSegment(currentIndex + 1);
    });

    eventBus.on("worksheet:segment-clicked", function(e, d) {
        if (self.activeSegmentIndex != null) self.deactivateSegment(self.activeSegmentIndex);
        var focusIndex = self.segmentIndexForID(d.id);
        self.activateSegment(focusIndex, true);
    });

    // * Evaluation *

    // The evaluation command will fire this event. The worksheet will then send a message to the evaluator
    // to do the evaluation itself.
    eventBus.on("worksheet:evaluate", function () {
        // check that it makes sense to evaluate
        var seg = self.getActiveSegment();
        if (seg == null) return;
        // evaluating a free segment does nothing except move the cursor to the next segment. It doesn't create a new
        // segment if this is the last.
        if (seg.type != "code") {
            eventBus.trigger("command:worksheet:leaveForward");
            return;
        }

        var code = seg.getCode();
        // clear the output
        seg.output("");
        seg.errorText("");
        seg.runningIndicator(true);

        eventBus.trigger("evaluator:evaluate", {code: code, segmentID: seg.id});

        // if this isn't the last segment, move to the next
        if (self.activeSegmentIndex != self.segments().length - 1) eventBus.trigger("command:worksheet:leaveForward");
        // if it is the last, create a new one at the end
        else eventBus.trigger("worksheet:newBelow")
    });

    // messages from the evaluator

    eventBus.on("evaluator:value-response", function (e, d) {
        var segID = d.segmentID;
        var seg = self.getSegmentForID(segID);
        seg.output(d.ns + " => " + d.value);
    });

    eventBus.on("evaluator:done-response", function (e, d) {
        var segID = d.segmentID;
        var seg = self.getSegmentForID(segID);
        seg.runningIndicator(false);
    });

    eventBus.on("evaluator:error-response", function (e, d) {
        var segID = d.segmentID;
        var seg = self.getSegmentForID(segID);
        seg.errorText(d.error);
    });

    return self;
};
