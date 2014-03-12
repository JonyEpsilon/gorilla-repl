/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */


/* Takes a data structure representing the output data and renders it in to the given element. */
var render = function (data, element, errorCallback) {
    var callbackQueue = [];
    var htmlString = renderPart(data, callbackQueue, errorCallback);
    $(element).html("<pre>" + htmlString + "</pre>");
    _.each(callbackQueue, function (callback) {callback()});
};


var renderPart = function (data, callbackQueue, errorCallback) {

    switch (data.type) {
        case "html":
            return renderHTML(data, callbackQueue, errorCallback);
        case "text":
            return renderText(data, callbackQueue, errorCallback);
        case "list-like":
            return renderListLike(data, callbackQueue, errorCallback);
        case "vega":
            return renderVega(data, callbackQueue, errorCallback);
        case "latex":
            return renderLatex(data, callbackQueue, errorCallback);
    }

    return "Unknown render type";
};

var renderHTML = function (data, callbackQueue, errorCallback) {
    return data.content;
};

var renderText = function (data, callbackQueue, errorCallback) {
    return _.escape(data.content);
};

var renderListLike = function (data, callbackQueue, errorCallback) {
    // first of all render the items
    var renderedItems = data.items.map(function (x) {return renderPart(x, callbackQueue, errorCallback)});
    // and then assemble the list
    return data.open + renderedItems.join(data.separator) + data.close;
};

var renderVega = function (data, callbackQueue, errorCallback) {

    var uuid = UUID.generate();

    // for some reason, Vega will sometimes try and pop up an alert if there's an error, which is not a
    // great user experience. Here we patch the error handling function to re-route any generated message
    // to the segment.
    vg.error = function (msg) {
        errorCallback("Vega error (js): " + msg);
    };

    callbackQueue.push(function () {
        vg.parse.spec(data.content, function (chart) {
            try {
                var element = $("#" + uuid).get()[0];
                chart({el: element, renderer: 'svg'}).update();
            } catch (e) {
                // we'll end up here if vega throws an error. We try and route this error back to the
                // segment so the user has an idea of what's going on.
                errorCallback("Vega error (js): " + e.message);
            }
        });
    });

    return "<center><span class='vega-span' id='" + uuid + "'></span></center>";
};

var renderLatex = function (data, callbackQueue, errorCallback) {

    var uuid = UUID.generate();

    callbackQueue.push(function () {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, uuid]);
    });

    return "<span class='latex-span' id='" + uuid + "'>@@" + data.content + "@@</span>";
};