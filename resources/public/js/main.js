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
    ws.segments().push(codeSegment("(defn f\n  [x y]\n  (let [q (* 2 x)\n        p (* 3 y)]\n    (+ p q)))", 0));
    ws.segments().push(codeSegment("(+ 1 2)", 1));
    ws.segments().push(codeSegment("(+ 1 3)", 2));
    ws.segments().push(codeSegment("(+ 1 4)", 3));
 //   for (var i = 4; i < 1000; i++) ws.segments()[i] = (codeSegment("(+ 1 " + i + ")", ws, i));
    var wsWrapper = worksheetWrapper(ws);

    ko.applyBindings(wsWrapper);

});