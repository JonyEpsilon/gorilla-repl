/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
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

ko.bindingHandlers.outputViewer = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {

        // get the value to display
        var value = ko.utils.unwrapObservable(valueAccessor()());
        if (value !== "") {
            var parsedValue = JSON.parse(value);
            console.log(parsedValue);
        }
        $(element).text(value);
    }
};