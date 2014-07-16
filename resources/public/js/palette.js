/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// The viewmodel for the 'palette' user interface component. This is used for a few things in Gorilla's UI.
// There is one palette viewmodel held by the app, corresponding to the palette div in the markup. It is reused each
// time it is shown. The only function that you should need to use is the `show` function, which brings up the palette.

var palette = function () {

    var self = {};

    self.shown = ko.observable(false);
    self.caption = ko.observable("Choose a command:");
    self.items = ko.observableArray();
    self.highlight = ko.observable(1);
    // this is used to control/read the focus state of the text input. This is the only part of the palette that will
    // take the focus, and is focused when the palette appears.
    self.focused = ko.observable(false);
    // the text the user has put in the filter box
    self.filterText = ko.observable("");

    // This function shows the palette with the given items. It's the only function on the palette that you should need
    // to call. The `items` should be an array of objects, with each object having a `desc` property, which is an HTML
    // string that will be shown to the user, and an `action` property which a function that will be called if that item
    // is selected.
    self.show = function (caption, items) {
        self.caption(caption);
        self.items.removeAll();
        // insert all of the items into the now empty observableArray
        self.items.push.apply(self.items, items);
        self.filterText("");
        self.highlight(0);
        self.shown(true);
        self.focused(true);
        self.scrollToNth(0,true);
    };

    self.hide = function () {
        self.shown(false);
    };

    self.moveSelectionDown = function () {
        var curPos = self.highlight();
        var newPos;
        if (curPos < (self.items().length - 1)) newPos = curPos + 1;
        else newPos = 0;
        self.highlight(newPos);
        self.scrollToNth(newPos, false);
    };

    self.moveSelectionUp = function () {
        var curPos = self.highlight();
        var newPos;
        if (curPos > 0) newPos = curPos - 1;
        else newPos = self.items().length - 1;
        self.highlight(newPos);
        self.scrollToNth(newPos, false);
    };

    self.scrollToNth = function (n, top) {
        var el = document.getElementById('palette-item-' + n);
        if (el) {
            // This isn't availble cross-browser, but it's much better when it is there
            if (el.scrollIntoViewIfNeeded) el.scrollIntoViewIfNeeded(top);
            // This is a bit janky at the moment, but it will do.
            else (el.scrollIntoView(top));
        }
    };

    self.handleItemClick = function (item) {
        item.action();
        self.hide();
    };

    self.handleOverlayClick = function () {
        self.hide();
    };

    self.handleKeyPress = function (d, event) {
        // up
        if (event.keyCode === 38) {
            self.moveSelectionUp();
            return false;
        }
        // down
        if (event.keyCode === 40) {
            self.moveSelectionDown();
            return false;
        }
        // esc
        if (event.keyCode === 27) {
            self.hide();
            return false;
        }
        // enter
        if (event.keyCode === 13) {
            var item = self.items()[self.highlight()];
            if (item) item.action();
            self.hide();
            return false;
        }
        // Pass through keypresses to the default handler.
        return true;
    };

    return self;
};