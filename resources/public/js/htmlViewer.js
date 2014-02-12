/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// A helper for rendering HTML output. If something goes wrong then the errorCallback will be called
// with the error message.

viewHTML = function (contents, element, errorCallback) {
    try {
        $(element).html("<div class='html-output'>" + contents + "</div>");
    } catch (e) {
        // we'll end up here if vega throws an error. We try and route this error back to the
        // segment so the user has an idea of what's going on.
        errorCallback("HTML viewer error (js): " + e.message);
    }
};