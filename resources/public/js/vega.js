/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// A helper for rendering a vega spec into a DOM element. If something goes wrong then the errorCallback will be called
// with the error message.

viewVega = function (spec, element, errorCallback) {
// for some reason, Vega will sometimes try and pop up an alert if there's an error, which is not a
// great user experience. Here we patch the error handling function to re-route any generated message
// to the segment.
    vg.error = function (msg) {
        errorCallback("Vega error (js): " + msg);
    };
    vg.parse.spec(spec, function (chart) {
        try {
            chart({el: element, renderer: 'svg'}).update();
        } catch (e) {
            // we'll end up here if vega throws an error. We try and route this error back to the
            // segment so the user has an idea of what's going on.
            errorCallback("Vega error (js): " + e.message);
        }
    });
};