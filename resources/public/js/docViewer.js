/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

var docViewer = function () {

    var self = {};

    var test = "clojure.core/map\n ([f coll] [f c1 c2] [f c1 c2 c3] [f c1 c2 c3 & colls])\nReturns a lazy sequence consisting of the result of applying f to the\nset of first items of each coll, followed by applying f to the set\nof second items in each coll, until any one of the colls is\nexhausted.  Any remaining items in other colls are ignored. Function\nf should accept number-of-colls arguments.";

    self.shown = ko.observable(false);
    self.doc = ko.observable("");
    self.show = function () {
        self.shown(true);
    };

    self.hide = function () {
        self.shown(false);
    };

    return self;
};