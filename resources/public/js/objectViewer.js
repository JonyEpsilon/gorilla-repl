/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// Several parts of this code are based on Douglas Crockford's public domain JSON implementation:
// https://github.com/douglascrockford/JSON-js

// If you were to infer from this code that I don't really know what I'm doing with jQuery, then you'd be right!


// This defines a binding that shows JS objects in an "inspector" style expandable format
ko.bindingHandlers.objectViewer = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = ko.utils.unwrapObservable(valueAccessor()());
        $(element).html("<div class='ov'></div>");
        process(value, $('.ov', $(element)));
    }
};
//
//    var process = function process (thing, element) {
//        // determine the type of the thing
//        var tp = determineType(thing);
//        // insert an appropriate representation of the thing
//        switch (tp) {
//            case "object":
//                processObject(thing, element);
//                break;
//            case "array":
//                processArray(thing, element);
//                break;
//            case "number":
//                $(element).append("<span class='ov-number'>" + cleanNumber(thing) + "</span>");
//                break;
//            case "boolean":
//                if (thing) {
//                    $(element).append("<span class='ov-boolean-true'>true</span>");
//                }
//                else {
//                    $(element).append("<span class='ov-boolean-false'>false</span>");
//                }
//                break;
//            case "string":
//                $(element).append("<span class='ov-string'>" + escapeString(thing) + "</span>");
//                break;
//            case "function":
//                $(element).append("<span class='ov-function'>(function)</span>");
//                break;
//            case "element":
//                $(element).append("<span class='ov-element'>&ltelement&gt</span>");
//                break;
//            case "undefined":
//                $(element).append("<span class='ov-undefined'>undefined</span>");
//                break;
//            case "null":
//                $(element).append("<span class='ov-undefined'>null</span>");
//                break;
//        }
//    };
//
//    var determineType = function (thing) {
//        if (_.isElement(thing)) return "element";
//        switch (typeof thing) {
//            // If the type is 'object', we might be dealing with an object or an array or
//            // null.
//            case 'object':
//                if (!thing) return "null";
//                if (Object.prototype.toString.apply(thing) === '[object Array]') return "array";
//                else return "object";
//            default:
//                return typeof thing;
//        }
//    };
//
//    var processObject = function (obj, element) {
//        // insert the object body
//        var objectContentElement = $("<span class='ov-object-header'><img src='img/disclosure-7.png' class='ov-open'/>" +
//            "Object</span><ul class='ov-object'></ul>");
//        // click handler on object header to show/hide contents
//        var img = $("img", $(objectContentElement));
//        var toggleVisibility = function () {
//            img.toggleClass("ov-closed");
//            img.toggleClass("ov-open");
//            $(objectContentElement[1]).slideToggle(200);
//            // stop the event from propagating to parent objects
//            return false;
//        };
//        $(objectContentElement[0]).click(toggleVisibility);
//
//        var objectListElement = $(objectContentElement[1]);
//        // iterate over the key-value pairs
//        for (var k in obj) {
//            if (Object.prototype.hasOwnProperty.call(obj, k)) {
//                var kvElem = $("<li class='ov-object-key'>" + escapeString(k) + ": </li>");
//                process(obj[k], kvElem);
//                objectListElement.append(kvElem);
//            }
//        }
//        // default to closed for large objects
//        $(element).append(objectContentElement);
//        if (objectListElement.children().length > 10) {
//            img.toggleClass("ov-closed");
//            img.toggleClass("ov-open");
//            $(objectContentElement[1]).hide();
//        }
//    };
//
//    var processArray = function (arr, element) {
//        // insert the array braces
//        var arrayElement = $("<span class='ov-array-header'><img src='img/disclosure-7.png' class='ov-open'/>" +
//            "Array</span><div class='ov-array'>[<span class='ov-array-items'></span>]</div>");
//        // click handler on object header to show/hide contents
//        var img = $("img", $(arrayElement));
//        var toggleVisibility = function () {
//            img.toggleClass("ov-closed");
//            img.toggleClass("ov-open");
//            $(arrayElement[1]).slideToggle(200);
//            // stop the event from propagating to parent objects
//            return false;
//        };
//        $(arrayElement[0]).click(toggleVisibility);
//        // iterate over the elements and insert them
//        var arrayContentElement = $('.ov-array-items', $(arrayElement));
//        // TODO: hack! We refuse to display big arrays until lazy loading (#37) is implemented.
//        if (arr.length > 150) {
//            arrayContentElement.append("array too big to display");
//        } else {
//            for (var i = 0; i < arr.length; i++) {
//                process(arr[i], arrayContentElement);
//                if (i !== (arr.length - 1)) arrayContentElement.append(", ");
//            }
//        }
//        // default to closed for large arrays
//        if (arr.length > 10) {
//            img.toggleClass("ov-closed");
//            img.toggleClass("ov-open");
//            $(arrayElement[1]).hide();
//        }
//
//        $(element).append(arrayElement);
//
//    };
//
//    var cleanNumber = function (num) {
//        if (isNumberInteger(num)) return num;
//        else return num.toPrecision(6);
//    };
//
//    var isNumberInteger = function (num) {
//        return num % 1 === 0;
//    };
//
//    var escapeString = function (str) {
//        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
//    };

