/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// The application entry point
$(function () {

    var ws = worksheet();
    ws.segments.push(codeSegment("(+ 1 1)", 1));
    ws.segments.push(codeSegment("(+ 1 2)", 2));
    ws.segments.push(codeSegment("(+ 1 3)", 3));
    ws.segments.push(codeSegment("(+ 1 4)", 4));
    var wsWrapper = worksheetWrapper(ws);

    ko.applyBindings(wsWrapper);

});