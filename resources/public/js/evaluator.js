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

    // check that it makes sense to evaluate
    var seg = app.worksheet.getActiveSegment();
    if (seg == null) return;
    if (seg.type != "code") return;

    var code = seg.getCode();
    // generate an ID to tie the evaluation to its results
    var id = UUID.generate();
    // store the evaluation ID and the segment ID in the evaluationMap
    evaluationMap[id] = seg.id;
    repl.execute(code, id);
    eventBus.trigger("command:worksheet:leaveForward");
});

eventBus.on("repl:response", function (e, d) {
    // handle the various different nREPL responses
    // - evaluation result (Hopefully no other responses have an ns component!)
    if (d.ns) {
        // look up the segment that this evaluation corresponds to
        var segID = evaluationMap[d.id];
        eventBus.trigger("evaluator:value-response", {ns: d.ns, value: d.value, segmentID: segID});
        return;
    }
    console.log(JSON.stringify(d));
});