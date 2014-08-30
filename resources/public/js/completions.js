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
    var ns = evaluator.currentNamespace;

    $.ajax({
        type: "GET",
        url: "/completions",
        data: {stub: word, ns: ns},
        success: function (data) {
            callback({
                list: data.completions,
                from: CodeMirror.Pos(cur.line, start),
                to: CodeMirror.Pos(cur.line, end)
            });

        }
    });

};