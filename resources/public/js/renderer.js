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
        case "raw":
            return renderRaw(data);
    }

    return "Unknown render type";
};

var renderRaw = function (data) {
    return data.content;
};