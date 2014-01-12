/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// The cursor listens on the eventBus and instructs the worksheet if it should change its state.
// This code is broken out in to its own module, but it is quite tightly coupled to the worksheet (see worksheet.js).

var cursor = function(worksheet) {

    eventBus.on("segment:leaveForward", function(e, d) {
        var leavingIndex = worksheet.segmentIndexForID(d.id);
        worksheet.deactivateSegment(leavingIndex);
        worksheet.activateSegment(leavingIndex + 1);
    });

};