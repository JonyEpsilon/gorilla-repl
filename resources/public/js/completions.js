/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

var clojureCompleter = function (cm, callback, options) {
    // The gist of this is lifted from the auto-completion modes included with CodeMirror.
    var cur = cm.getCursor();
    var token = cm.getTokenAt(cur);
    var word = token.string;
    var start = token.start;
    var end = token.end;

    // we need to know what namespace the user is currently working in, which we get from the evaluator module
    var ns = repl.currentNamespace;

    repl.getCompletions(word, ns, null, function (compl) {
        var completions = {
            list: compl,
            from: CodeMirror.Pos(cur.line, start),
            to: CodeMirror.Pos(cur.line, end)
        };

        // We show docs for the selected completion
        CodeMirror.on(completions, "select", function (s) {
            repl.getCompletionDoc(s, ns, function (docs) {
                eventBus.trigger("completer:show-doc", docs);
            });
        });

        // When the autocomplete UI is dismissed, hide the docs
        CodeMirror.on(completions, "close", function () {
            eventBus.trigger("completer:hide-doc");
        });

        // Show the UI
        callback(completions);
    });
};
