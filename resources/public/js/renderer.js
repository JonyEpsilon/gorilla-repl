/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */


/* Takes a data structure representing the output data and renders it in to the given element. */
var render = function (data, element) {
    var callbackQueue = [];
    var htmlString = renderPart(data, callbackQueue);
    $(element).html(htmlString);
    setTimeout(function () {
      _.each(callbackQueue, function (callback) {callback()});
    }, 1000);
};


var renderPart = function (data, callbackQueue) {

    switch (data.type) {
        case "html":
            return renderHTML(data);
        case "list-like":
            return renderListLike(data);
        case "vega":
            return renderVega(data, callbackQueue);
    }

    return "Unknown render type";
};

var renderHTML = function (data) {
    return data.content;
};

var renderListLike = function (data) {
    // first of all render the items
    var renderedItems = data.items.map(renderPart);
    // and then assemble the list
    var html = data.open;
    _.map(renderedItems, function (item) {html = html + item + data.separator});
    return html + data.close;
};

var renderVega = function (data, callbackQueue) {

    var uuid = UUID.generate();

    callbackQueue.push(function () {
        vg.parse.spec(data.content, function (chart) {
            try {
                var element = $("#" + uuid).get();
                chart({el: element, renderer: 'svg'}).update();
            } catch (e) {
                // we'll end up here if vega throws an error. We try and route this error back to the
                // segment so the user has an idea of what's going on.
                console.log("Vega error (js): " + e.message);
            }
        });
    });

    return "<div id='" + uuid + "'></div>";
};
