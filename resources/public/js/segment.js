/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// a free segment contains markdown
var freeSegment = function (contents, id) {
    var self = {};
    self.renderTemplate = "free-segment-template";

    self.type = "free";

    // Segment UI state
    self.active = ko.observable(false);

    // The markdown content
    self.content = markdownEditor.makeMarkdownEditorViewmodel(
        self.id(),
        contents
    );

    return self;
};

// a code segment contains code, and shows the results of running that code.
var codeSegment = function (contents, id) {
    var self = {};
    self.renderTemplate = "code-segment-template";
    self.worksheet = worksheet;
    if (id) self.id = id;
    else self.id = UUID.generate();
    self.type = "code";

    // Segment configuration
    self.liveEvaluationMode = ko.observable(false);

    // Segment UI state
    self.active = ko.observable(false);
    self.errorText = ko.observable("");
    self.runningIndicator = ko.observable(false);
    self.output = ko.observable("Hello, world!");
    self.warningIndicator = ko.observable(false);
    self.outputVisible = ko.observable(true);

    // The code
    self.content = codemirrorVM(
        self.id,
        contents,
        "text/x-clojure"
    );

    // activation and deactivation - these control whether the segment has the "cursor" outline, and focus
    // the content component.

    // activate the segment. fromTop will be true is the user's focus is coming from above (and so the cursor should
    // be placed at the top), false indicates the focus is coming from below.
    self.activate = function (fromTop) {
        self.active(true);
        if (fromTop) self.content.positionCursorAtContentStart();
        else self.content.positionCursorAtContentEnd();
    };

    self.deactivate = function () {
        self.active(false);
    };

    return self;
};
