/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */


var evaluator = function () {

    var self = {};

    self.currentEvaluationSegment = null;
    self.currentEvaluationID = null;
    self.currentNamespace = "user";
    self.evalRunning = false;

    // when the evaluator is asked to evaluate some code, it puts it in a queue. Queue items are processed after the
    // last item has signalled that its done (by a 'done' message from nREPL). This is done because I can't figure out
    // whether it's ok to send nREPL overlapping eval messages - it seems like the answer is no).
    eventBus.on("evaluator:evaluate", function (e, d) {
        addToEvaluationQueue(d);
    });

    var uiUpdateDelay = 50;
    var evaluationQueue = [];

    // Adds an evaluation to the queue. The queue is processed by evaluating successive items, with a 'breather'
    // in between items for the UI to catch up, until there is nothing left to evaluate. Here we add an item, and if
    // its the only item start queue processing. Queue processing will be continued by the handler that response to
    // 'done' messages (see below)>
    var addToEvaluationQueue = function (msg) {
        evaluationQueue.push(msg);
        if (evaluationQueue.length === 1 && !self.evalRunning) setTimeout(processEvaluationQueueItem, uiUpdateDelay);
    };

    // Start processing an eval request. Note that this function returns asynchronously to the evaluation - it's
    // likely still running.
    var processEvaluationQueueItem = function () {
        var msg = evaluationQueue.shift();
        self.evalRunning = true;
        // generate an ID to tie the evaluation to its results - when responses are received, we route them to the
        // originating segment for display using this ID (see the repl:response event handler below).
        var id = UUID.generate();
        // store the evaluation ID and the segment ID in the evaluationMap
        self.currentEvaluationID = id;
        self.currentEvaluationSegment = msg.segmentID;
        console.log("E: " + JSON.stringify(msg) + "  ID: " + id);
        repl.execute(msg.code, id);
    };

    // Interrupts the current evaluation, by sending an interrupt op to nREPL, and removes any queued evaluations.
    eventBus.on("evaluator:interrupt", function () {
        if (self.currentEvaluationID) repl.interrupt(self.currentEvaluationID);
        // We immediately mark the current evaluation as done, updating the UI.
        // This is because nREPL doesn't always respond reliably to interrupt events, and so is the best we can do.
        signalCurrentEvaluationDone();
        // Tell the UI all pending evaluations are complete.
        evaluationQueue.forEach(function (e) {
            eventBus.trigger("evaluator:done-response", {segmentID: e.segmentID});
        });
        evaluationQueue = [];
    });

    var signalCurrentEvaluationDone = function () {
        if (self.currentEvaluationSegment) {
            eventBus.trigger("evaluator:done-response", {segmentID: self.currentEvaluationSegment});
            self.currentEvaluationID = null;
            self.currentEvaluationSegment = null;
            self.evalRunning = false;
        }
    };

    // handle the various different nREPL responses
    eventBus.on("repl:response", function (e, d) {
        console.log(JSON.stringify(d));
        // Watch out for messages that come in when there is supposed to be no evaluation
        if (self.currentEvaluationSegment == null) {
            console.log("Orphaned response: " + JSON.stringify(d));
            return;
        }
        // - evaluation result (Hopefully no other responses have an ns component!)
        if (d.ns) {
            self.currentNamespace = d.ns;
            eventBus.trigger("evaluator:value-response",
                {ns: d.ns, value: d.value, segmentID: self.currentEvaluationSegment});
            return;
        }
        // - console output
        if (d.out) {
            eventBus.trigger("evaluator:console-response",
                {out: d.out, segmentID: self.currentEvaluationSegment});
            return;
        }
        // - status response
        if (d.status) {
            // is this an evaluation done message
            if (d.status.indexOf("done") >= 0) {
                // only respond to messages that match the evaluation ID (in particular, interrupt ops reply
                // with their own done message).
             //   if (d.id == self.currentEvaluationID) {
                    // update the state and ...
                    signalCurrentEvaluationDone();
                    // ... if there's anything left in the queue we schedule another evaluation
                    if (evaluationQueue.length !== 0) setTimeout(processEvaluationQueueItem, uiUpdateDelay);
                    return;
            //    }
            }
        }
        // - error message
        if (d.err) {
            eventBus.trigger("evaluator:error-response",
                {error: d.err, segmentID: self.currentEvaluationSegment});
            return;
        }
        // - root-ex message
        if (d['root-ex']) {
            // at the minute we just eat (and log) these - I'm not really sure what they're for!
            console.log("Root-ex message: " + JSON.stringify(d));
            return;
        }
        console.log("Unidentified message: " + JSON.stringify(d));
    });

    return self;
}();