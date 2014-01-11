/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// This is a viewmodel and KO binding for the codemirror code editor. You should apply the codemirror binding
// to a textarea, and bind it to a viewmodel made with makeCodeMirrorViewmodel.
//
// The viewmodel takes a parameter to a cursor callback object. This object is notified of any events that
// are relevant to the worksheet cursor, namely if the focus is entering or leaving the editor. The editor can be
// given an id, and it will pass this id in to the cursor callbacks.
//
// It also implements the standard functions that a segment content item should: positionCursorAtContentStart,
// positionCursorAtContentEnd, and positionCursorAtContentStartOfLastLine

var codemirrorVM = function (id, cursorCallbackObject, initialContents, contentType) {
    var self = {};
    self.id = id;
    self.contentType = contentType;

    self.contents = ko.observable(initialContents);

    // asks the editor to redraw itself. Needed when its size has changed.
    self.reflow = function () {
        self.codeMirror.refresh();
    };

    // Cursor callback methods. These will be called by the CodeMirror component, and will notify the cursorCallback
    // that a change of cell focus should happen.
    self.notifyMoveCursorBack = function () {
        cursorCallbackObject.notifyMoveCursorBack(id);
    };

    self.notifyMoveCursorForward = function () {
        cursorCallbackObject.notifyMoveCursorForward(id);
    };

    self.notifyFocused = function () {
        cursorCallbackObject.notifyFocused(id);
    };

//    self.notifyBackspaceOnEmpty = function () {
//        cursorCallbackObject.notifyBackspaceOnEmpty();
//    };

    // These can be called to position the CodeMirror cursor appropriately. They are used when the cell is receiving
    // focus from another cell.
    self.positionCursorAtContentStart = function () {
        self.codeMirror.focus();
        self.codeMirror.setCursor(0, 0);
        self.codeMirror.focus();
    };

    self.positionCursorAtContentEnd = function () {
        self.codeMirror.focus();
        // TODO: Bit of a fudge doing this here!
        self.reflow();
        // position the cursor past the end of the content
        self.codeMirror.setCursor(self.codeMirror.lineCount(), 0);
        self.codeMirror.focus();
    };

    self.positionCursorAtContentStartOfLastLine = function () {
        self.codeMirror.focus();
        self.codeMirror.setCursor(self.codeMirror.lineCount() - 1, 0);
        self.codeMirror.focus();
    };


    return self;
};

ko.bindingHandlers.codemirror = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var cm = CodeMirror.fromTextArea(element,
            {
                lineNumbers: false,
                matchBrackets: true,
                lineWrapping: true,
                mode: valueAccessor().contentType,
                onKeyEvent: function (editor, event) {
                    // only check on cursor key keydowns
                    if (event.type === 'keydown') {
                        // up
                        var curs;
                        if (event.keyCode === 38) {
                            // get the current cursor position
                            curs = editor.getCursor();
                            // check for first line
                            if (curs.line === 0) valueAccessor().notifyMoveCursorBack();
                        }
                        // left
                        if (event.keyCode === 37) {
                            // get the current cursor position
                            curs = editor.getCursor();
                            // check for first line, start position
                            if (curs.line === 0 && curs.ch === 0) valueAccessor().notifyMoveCursorBack();
                        }
                        // down
                        if (event.keyCode === 40) {
                            // get the current cursor position
                            curs = editor.getCursor();
                            // check for last line
                            if (curs.line === (editor.lineCount() - 1)) valueAccessor().notifyMoveCursorForward();
                        }
                        // right
                        if (event.keyCode === 39) {
                            // get the current cursor position
                            curs = editor.getCursor();
                            // check for last line, last position
                            if (curs.line === (editor.lineCount() - 1)) {
                                if (curs.ch === editor.getLine(curs.line).length)
                                    valueAccessor().notifyMoveCursorForward();
                            }
                        }
//                        // delete on an empty editor
//                        if (event.keyCode === 8) {
//                            if (editor.getValue() === "") valueAccessor().notifyBackspaceOnEmpty();
//                        }
                    }
                }
            });

        // this function is called back by codemirror when ever the contents changes.
        // It keeps the model in sync with the code.
        cm.on('change', function (editor) {
            var value = valueAccessor();
            value.contents(editor.getValue());
        });
        cm.on('focus', function () {
            valueAccessor().notifyFocused();
        });
        // store the editor object on the viewmodel
        valueAccessor().codeMirror = cm;
        // set the initial content
        cm.setValue(ko.utils.unwrapObservable(valueAccessor().contents));
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var cm = valueAccessor().codeMirror;
        var value = ko.utils.unwrapObservable(valueAccessor().contents);
        // KO will trigger this update function whenever the model changes, even if that change
        // is because the editor itself has just updated the model. This messes with the cursor
        // position, so we check here whether the value really has changed before we interfere
        // with the editor.
        if (value !== cm.getValue()) cm.setValue(value);
    }
};
