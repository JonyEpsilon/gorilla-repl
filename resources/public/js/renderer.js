/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */


/* Takes a data structure representing the output data and renders it in to the given element. */
var render = function (data, element) {
    var htmlString = renderPart(data);
    $(element).html(htmlString);
};


var renderPart = function (data) {

    switch (data.type) {
        case "html":
            return renderHTML(data);
        case "list-like":
            return renderListLike(data);
        case "vega":
            return renderVega(data);
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

var renderVega = function (data) {

};
