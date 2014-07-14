/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */


var evaluator = function () {

    var self = {};

    // This maps evaluation IDs to the IDs of the segment that initiated them.
    self.evaluationMap = {};
    self.currentNamespace = "user";

    eventBus.on("evaluator:evaluate", function (e, d) {
        // generate an ID to tie the evaluation to its results - when responses are received, we route them to the
        // originating segment for display using this ID (see the repl:response event handler below).
        var id = UUID.generate();
        // store the evaluation ID and the segment ID in the evaluationMap
        self.evaluationMap[id] = d.segmentID;
        repl.execute(d.code, id);
    });

    // handle the various different nREPL responses
    eventBus.on("repl:response", function (e, d) {

        // look up the segment that this evaluation corresponds to
        var segID = self.evaluationMap[d.id];
        if (segID == null) {
            console.log("Orphaned response: " + JSON.stringify(d));
        }

        // - evaluation result (Hopefully no other responses have an ns component!)
        if (d.ns) {
            self.currentNamespace = d.ns;
            eventBus.trigger("evaluator:value-response", {ns: d.ns, value: d.value, segmentID: segID});
            return;
        }
        // - console output
        if (d.out) {
            eventBus.trigger("evaluator:console-response", {out: d.out, segmentID: segID});
            return;
        }
        // - status response
        if (d.status) {
            // is this an evaluation done message
            if (d.status.indexOf("done") >= 0) {
                eventBus.trigger("evaluator:done-response", {segmentID: segID});
                // keep the evaluation map clean
                delete self.evaluationMap[d.id];
                return;
            }
        }
        // - error message
        if (d.err) {
            eventBus.trigger("evaluator:error-response", {error: d.err, segmentID: segID});
            return;
        }
        // - root-ex message
        if (d['root-ex']) {
            // at the minute we just eat (and log) these - I'm not really sure what they're for!
            console.log("Root-ex message: " + JSON.stringify(d));
            return;
        }
        console.log(JSON.stringify(d));
    });

    return self;
}();