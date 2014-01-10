/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// a free segment contains markdown
var freeSegment = function (contents, id) {
    var self = {};

    self.type = "free";

    self.content = markdownEditor.makeMarkdownEditorViewmodel(
        self.id(),
        self.cursor.getContentCursorCallback(),
        contents
    );

    self.getModel = function () {
        return {
            id: self.id(),
            type: self.type,
            content: self.content.markupEditor.contents()
        }
    };

    return self;
};

// a code segment contains code, and shows the results of running that code.
var codeSegment = function (contents, id) {
    var self = {};
    self.type = "code";

    // Segment configuration
    self.liveEvaluationMode = ko.observable(false);

    // Segment UI
    self.errorText = ko.observable("");
    self.runningIndicator = ko.observable(false);
    self.output = ko.observable("");
    self.warningIndicator = ko.observable(false);

    // The code
    self.content = codeMirrorVM(
        self.id(),
        self.cursor.getContentCursorCallback(),
        contents,
        self.evaluationType
    );

    // this event handler is hooked to the segment keypress event
    self.handleSegmentKeypress = function (data, event) {
        // shift and enter evaluates - some cross browser fiddling here.
        if (event.shiftKey && ((event.charCode === 13) || (event.keyCode === 13))) {
            // shift and enter doesn't do anything to read-only worksheets
            if (require('js/application').isWorksheetEditable()) self.evaluate();
            event.preventDefault();
            return;
        }
        return true;
    };

    // we listen for changes to the editor contents, and if in live evaluation mode re-run
    // segment.
    self.content.contents.subscribe(function () {
        if (self.liveEvaluationMode()) self.liveEvaluate();
    });

    return self;
};
