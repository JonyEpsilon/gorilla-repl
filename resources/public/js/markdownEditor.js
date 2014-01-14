/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */


var markdownEditor = function (id, cursorCallbackObject, initialContents) {
    var self = {};

    // var mdConverter = Markdown.getSanitizingConverter();
    var mdConverter = new Markdown.Converter();

    self.markupEditor = codemirrorVM(id, initialContents, "text/x-markdown");
    self.renderedContent = ko.computed(function () {
        return mdConverter.makeHtml(self.markupEditor.contents());
    }).extend({throttle: 50});

//    self.handleMarkupKeyup = function (data, event) {
//        // esc pressed
//        if (event.keyCode === 27) cursorCallbackObject.notifyExit();
//        if (event.shiftKey && (event.keyCode === 13)) {
//            cursorCallbackObject.notifyExit();
//            return false;
//        }
//        return true;
//    };
//
//    // content cursor placement requests are passed straight through to the editor component
//    self.positionCursorAtContentStart = self.markupEditor.positionCursorAtContentStart;
//    self.positionCursorAtContentEnd = self.markupEditor.positionCursorAtContentEnd;
//    self.positionCursorAtContentStartOfLastLine = self.markupEditor.positionCursorAtContentStartOfLastLine;

    return self;
};

