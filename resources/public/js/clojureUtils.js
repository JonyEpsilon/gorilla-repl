/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// Functions for handling clojure code in javascript.

// takes a string and prefixes every line with ';; '
var makeClojureComment = function (code) {
    return code.split('\n').map(function (x) {
        return ";;; " + x;
    }).join("\n")
};

// the funny name indicates that it undoes what the above function does. It doesn't check whether the line is actually
// commented, so will break text that isn't in the format it expects.
var unmakeClojureComment = function (code) {
    if (code) {
        return code.split('\n').map(function (x) {
            return x.slice(4);
        }).join("\n");
    }
    else return null;
};