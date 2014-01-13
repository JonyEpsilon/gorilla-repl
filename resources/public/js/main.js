/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

var app = (function () {

    var self = {};

    self.start = function () {
        // start the REPL
        repl.connect();

        // prepare a skeleton worksheet
        var ws = worksheet();
        ws.segments().push(codeSegment("(defn f\n  [x y]\n  (let [q (* 2 x)\n        p (* 3 y)]\n    (+ p q)))"));
        ws.segments().push(codeSegment("(f 20 30)"));
        var wsWrapper = worksheetWrapper(ws);
        self.worksheet = ws;

        ko.applyBindings(wsWrapper);
    };

    return self;
})();

// The application entry point
$(function () {
    app.start();
});