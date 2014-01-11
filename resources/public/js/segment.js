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
        self.cursor.getContentCursorCallback(),
        contents
    );

    return self;
};

// a code segment contains code, and shows the results of running that code.
var codeSegment = function (contents, id) {
    var self = {};
    self.renderTemplate = "code-segment-template";
    self.id = id;
    self.type = "code";

    // Segment configuration
    self.liveEvaluationMode = ko.observable(false);

    // Segment UI state
    self.active = ko.observable(false);
    self.errorText = ko.observable("");
    self.runningIndicator = ko.observable(false);
    self.output = ko.observable("");
    self.warningIndicator = ko.observable(false);
    self.objectBrowserVisible = ko.observable(false);

    // The code
    self.content = codemirrorVM(
        self.id,
        self,
        contents,
        "text/clojure"
    );

    return self;
};
