/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// Takes the REPL output and views it. Mostly, this is just displaying it as a string, but some special forms (like
// vega graphics specs) receive special treatment.
//
// Note that this is very primitive at the moment, there is very little 'understanding' on the javascript side of what
// the output is - we convert it in to a js structure, but don't do much with it. Much more would be possible if we were
// to parse the output and generate output from the parse tree (think lists of graphics for instance). But that can come
// later.

goog.require("gorilla.util");

ko.bindingHandlers.outputViewer = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {

        // get the value to display
        var value = ko.utils.unwrapObservable(valueAccessor()());
        // to handle any errors, we need to know the ID of the segment that this output belongs to
        var segID = allBindingsAccessor.get('segmentID');
        var errorHandler = function (msg) {
            eventBus.trigger("output:output-error", {segmentID: segID, error: msg});
            // set the output to plain text
            $(element).html('<pre><code>' + value + '</code></pre>');
        };

        if (value !== "") {
            // first try and parse the output as EDN. It might not be valid EDN, so this can and will fail.
            // TODO: switch to real EDN parser
            var jsValue = {};
            try {
                jsValue = gorilla.util.clojureStringToJS(value);
            } catch (e) {
                // not a lot we can do if anything goes wrong - and it's expected to happen often, so just ignore!
            }

            // if the object has a key called vega at the top level, then we treat it as a Vega graphics spec
            if (jsValue.vega) {
                renderVega(jsValue.vega, element, errorHandler);
                return;
            }

            // default is just to show plain html
            $(element).html('<pre><code>' + value + '</code></pre>');
        }
    }
};