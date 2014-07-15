var palette = function () {

    var self = {};

    self.shown = ko.observable(true);
    self.caption = ko.observable("Choose a command:");
    self.items = [];//commandList;
    self.highlight = ko.observable(1);
    // this is used to control/read the focus state of the text input. This is the only part of the palette that will
    // take the focus, and is focused when the palette appears.
    self.focused = ko.observable(false);
    // the text the user has put in the filter box
    self.filterText = ko.observable("");

    self.show = function () {
        self.filterText("");
        self.highlight(0);
        self.shown(true);
        self.focused(true);
    };

    self.hide = function () {
        self.shown(false);
    };

    self.moveSelectionDown = function () {
        var curPos = self.highlight();
        if (curPos < (self.items.length - 1)) self.highlight(curPos + 1);
        else self.highlight(0);
    };

    self.moveSelectionUp = function () {
        var curPos = self.highlight();
        if (curPos > 0) self.highlight(curPos - 1);
        else self.highlight(self.items.length - 1);
    };

    self.handleItemClick = function (index) {
        console.log(index);
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
            console.log("Action!");
            return false;
        }
        // Pass through keypresses to the default handler.
        return true;
    };

    return self;
};