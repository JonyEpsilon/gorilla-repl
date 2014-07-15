var palette = function () {

    var self = {};

    self.shown = ko.observable(true);
    self.caption = ko.observable("Choose a command");
    self.items = commandList;

    return self;
};