/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
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

    // we need to know what namespace the user is currently working in, which we get from the evaluator module
    var ns = evaluator.currentNamespace;

    // This call must be synchronous as CodeMirror expects a reply right now. This stops us from just sending an
    // nREPL message, which is always async, hence the HTTP API endpoint.
    var completions = [];
    $.ajax({
        type: "GET",
        url: "/completions",
        data: {stub: word, ns: ns},
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