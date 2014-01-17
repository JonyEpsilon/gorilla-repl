/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// Takes the REPL output and views it. Mostly, this is just displaying it as a string, but some special forms (like
// vega graphics specs) receive special treatment.

ko.bindingHandlers.outputViewer = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        // get the value to display
        var value = ko.utils.unwrapObservable(valueAccessor()());
        var elem = $(element);

        elem.html(value);
    }
};
