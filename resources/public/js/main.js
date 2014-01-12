/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// here so we can mess with the worksheet in the debugger
var ws;

// The application entry point
$(function () {

    ws = worksheet();
    ws.segments.push(codeSegment("(defn f\n  [x y]\n  (let [q (* 2 x)\n        p (* 3 y)]\n    (+ p q)))", ws, 1));
    ws.segments.push(codeSegment("(+ 1 2)", ws, 2));
    ws.segments.push(codeSegment("(+ 1 3)", ws, 3));
    ws.segments.push(codeSegment("(+ 1 4)", ws, 4));
    var wsWrapper = worksheetWrapper(ws);

    ko.applyBindings(wsWrapper);

});