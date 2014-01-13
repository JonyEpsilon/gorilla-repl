/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// This maps evaluation IDs to the IDs of the segment that initiated them.
evaluationMap = {};

eventBus.on("command:evaluator:evaluate", function () {
    // There are several things to do be done:
    // - we need to find the active segment and get the code contained within it
    // - we must send this send this code across to the REPL, tagging it with an ID that we keep a note of
    // - when responses are received, route them to the originating segment for display (see the repl:response event
    // handler below).

    // TODO: it feels a bit wrong to do this here (seems to know a lot about the internals of a segment). Should
    // think whether this is the right structure.

    // check that it makes sense to evaluate
    var seg = app.worksheet.getActiveSegment();
    if (seg == null) return;
    if (seg.type != "code") return;

    var code = seg.getCode();
    seg.runningIndicator(true);
    
    // generate an ID to tie the evaluation to its results
    var id = UUID.generate();
    // store the evaluation ID and the segment ID in the evaluationMap
    evaluationMap[id] = seg.id;
    repl.execute(code, id);
    eventBus.trigger("command:worksheet:leaveForward");
});

// handle the various different nREPL responses
eventBus.on("repl:response", function (e, d) {

    // look up the segment that this evaluation corresponds to
    var segID = evaluationMap[d.id];

    // - evaluation result (Hopefully no other responses have an ns component!)
    if (d.ns) {
        eventBus.trigger("evaluator:value-response", {ns: d.ns, value: d.value, segmentID: segID});
        return;
    }
    // - status response
    if (d.status) {
        // is this an evaluation done message
        if (d.status.indexOf("done") >= 0) {
            eventBus.trigger("evaluator:done-response", {segmentID: segID});
            delete evaluationMap[d.id];
            return;
        }
    }
    console.log(JSON.stringify(d));
});