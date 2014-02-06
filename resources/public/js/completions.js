/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

var clojureCompleter = function (cm, options) {
    // The gist of this is lifted from the auto-completion modes included with CodeMirror.
    var cur = cm.getCursor();
    var token = cm.getTokenAt(cur);
    var word = token.string;
    var start = token.start;
    var end = token.end;

    var completions = [];
    $.ajax({
        type: "GET",
        url: "/completions",
        data: {stub: word},
        async: false,
        success: function (data) {
            completions = data.completions;
        }
    });

    return {
        list: completions,
        from: CodeMirror.Pos(cur.line, start),
        to: CodeMirror.Pos(cur.line, end)
    };
};