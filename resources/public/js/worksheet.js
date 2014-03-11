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

    self.showStatusMessage = function (message) {
        self.status(message);
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

    // serialises the worksheet for saving. The result is valid clojure code, marked up with some magic comments.
    self.toClojure = function () {
        return ";; gorilla-repl.fileformat = 1\n\n" +
            self.segments().map(function (s) {
                return s.toClojure()
            }).join('\n');
    };

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
        // after deletion, should activate segment after, unless it was the last segment, or there are no segments
        // remaining.
        if (self.segments().length == 0) return;
        if (index == self.segments().length) self.activateSegment(self.segments().length - 1, true);
        else self.activateSegment(index, false);
    };

    // ** Event handlers **
    // TODO: this is slightly nasty. The event handlers close over worksheet properties, so need to be removed and re-
    // TODO: added whenever the worksheet is changed. Maybe they shouldn't live here?

    // We store a list of added event types, by using this helper function to add events. This allows us to cleanly
    // deregister all the event handlers if the worksheet is to be replaced.
    var eventTypeList = [];
    var addEventHandler = function (event, callback) {
        eventTypeList.push(event);
        eventBus.on(event, callback);
    };
    // remove all worksheet event handlers from the bus - note that this will remove event handlers for _all_ worksheets
    // that exist, not just this one!
    self.removeEventHandlers = function () {
        eventTypeList.map(function (e) {eventBus.off(e);});
    };

    // * Activation cursor / focus handling *

    // activation/deactivation and focusing of segments.
    addEventHandler("worksheet:leaveForward", function () {
        var leavingIndex = self.activeSegmentIndex;
        // can't leave the bottom segment forwards
        if (leavingIndex == self.segments().length - 1) return;
        self.deactivateSegment(leavingIndex);
        self.activateSegment(leavingIndex + 1, true);
    });

    addEventHandler("worksheet:leaveBack", function () {
        var leavingIndex = self.activeSegmentIndex;
        // can't leave the top segment upwards
        if (leavingIndex == 0) return;
        self.deactivateSegment(leavingIndex);
        self.activateSegment(leavingIndex - 1, false);
    });

    // the event for this action contains the segment id
    addEventHandler("worksheet:segment-clicked", function (e, d) {
        if (self.activeSegmentIndex != null) self.deactivateSegment(self.activeSegmentIndex);
        var focusIndex = self.segmentIndexForID(d.id);
        self.activateSegment(focusIndex, true);
    });

    // * Manipulating segments *

    addEventHandler("worksheet:delete", function () {
        // if there's only one segment, don't delete it
        if (self.segments().length == 1) return;
        var deleteIndex = self.activeSegmentIndex;
        self.deleteSegment(deleteIndex);
    });

    addEventHandler("worksheet:newBelow", function () {
        // do nothing if no segment is active
        if (self.activeSegmentIndex == null) return;
        var seg = codeSegment("");
        var currentIndex = self.activeSegmentIndex;
        self.deactivateSegment(currentIndex);
        self.segments.splice(currentIndex + 1, 0, seg);
        self.activateSegment(currentIndex + 1);
    });

    // * Changing segment types *

    // a helper function that changes the type of the active segment
    var changeActiveSegmentType = function (newType, newSegmentConstructor) {
        var index = self.activeSegmentIndex;
        if (index == null) return;
        var seg = self.segments()[index];
        // if the segment is already a free segment, do nothing.
        if (seg.type == newType) return;

        var contents = seg.getContents();
        var newSeg = newSegmentConstructor(contents);
        self.segments.splice(index, 1, newSeg);
        self.activateSegment(index, true);
    };

    addEventHandler("worksheet:changeToFree", function () {
        changeActiveSegmentType("free", freeSegment);
    });

    addEventHandler("worksheet:changeToCode", function () {
        changeActiveSegmentType("code", codeSegment);
    });

    // * Toggling live mode *

    addEventHandler("worksheet:toggle-live", function () {
        var seg = self.getActiveSegment();
        if (seg == null) return;

        if (seg.type == "code") {
            var oldVal = seg.liveEvaluationMode();
            seg.liveEvaluationMode(!oldVal);
        }
    });

    // * Evaluation *

    // The evaluation command will fire this event. The worksheet will then send a message to the evaluator
    // to do the evaluation itself.
    addEventHandler("worksheet:evaluate", function () {
        // check that a segment is active
        var seg = self.getActiveSegment();
        if (seg == null) return;

        if (seg.type == "code") {
            // if this is a code segment, then evaluate the contents
            var code = seg.getContents();
            // clear the output
            seg.clearOutput();
            seg.clearErrorAndConsole();
            seg.runningIndicator(true);

            eventBus.trigger("evaluator:evaluate", {code: code, segmentID: seg.id});
        }

        // if this isn't the last segment, move to the next
        if (self.activeSegmentIndex != self.segments().length - 1) eventBus.trigger("command:worksheet:leaveForward");
        // if it is the last, create a new one at the end
        else eventBus.trigger("worksheet:newBelow")
    });

    // A minimal evaluation handler that is called when in live mode. The output is not cleared each time.
    addEventHandler("worksheet:live-evaluate", function () {
        // check that a segment is active
        var seg = self.getActiveSegment();
        if (seg == null) return;

        if (seg.type == "code") {
            // if this is a code segment, then evaluate the contents
            var code = seg.getContents();
            seg.clearErrorAndConsole();
            eventBus.trigger("evaluator:evaluate", {code: code, segmentID: seg.id});
        }
    });

    // messages from the evaluator

    addEventHandler("evaluator:value-response", function (e, d) {
        var segID = d.segmentID;
        var seg = self.getSegmentForID(segID);
        try {
            // If you're paying attention, you'll notice that the value gets JSON.parse'd twice: once here, and again
            // in the output viewer. This is a workaround for a problem in the rendering nREPL middleware that results
            // in the string begin double escaped. This round of parsing should just unescape the string, leaving a
            // string that will JSON.parse to the object. This round of unescaping is done here in order that the
            // value associated with the segment (and hence saved in the worksheet) is not double escaped.
            var parsedValue = JSON.parse(d.value);
            seg.output(parsedValue);
        } catch (e) {
            // if anything goes wrong, fall back to displaying the raw response.
            seg.output(d.value);
        }
    });

    addEventHandler("evaluator:console-response", function (e, d) {
        var segID = d.segmentID;
        var seg = self.getSegmentForID(segID);
        var oldText = seg.consoleText();
        // note that no escaping is done to console strings - you could cause havoc by returning inappropriate HTML
        // if you were so minded.
        seg.consoleText(oldText + d.out);
    });

    addEventHandler("evaluator:done-response", function (e, d) {
        var segID = d.segmentID;
        var seg = self.getSegmentForID(segID);
        seg.runningIndicator(false);
    });

    addEventHandler("evaluator:error-response output:output-error", function (e, d) {
        var segID = d.segmentID;
        var seg = self.getSegmentForID(segID);
        seg.errorText(d.error);
    });


    // * Auto-completion *

    addEventHandler("worksheet:completions", function (e, d) {
        // check that a segment is active
        var seg = self.getActiveSegment();
        if (seg == null) return;
        if (seg.type == "code") {
            seg.content.complete(clojureCompleter);
        }
     });


    return self;
};