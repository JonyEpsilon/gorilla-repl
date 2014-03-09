/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// Takes the REPL output and views it.

ko.bindingHandlers.outputViewer = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {

        // get the value to display
        var value = ko.utils.unwrapObservable(valueAccessor()());

        // to handle any errors, we need to know the ID of the segment that this output belongs to
        var segID = allBindingsAccessor.get('segmentID');
        // the errorHandler will route error messages to the segment's error div
        var errorHandler = function (msg) {
            eventBus.trigger("output:output-error", {segmentID: segID, error: msg});
        };

        if (value !== "") {
            // TODO: would be better not to have to do this!
            var parsedValue = JSON.parse(JSON.parse(value));
            console.log(parsedValue);
            render(parsedValue, element, errorHandler);
        }
        else $(element).html("");
    }
};