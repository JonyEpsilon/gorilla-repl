/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// Listens for "command:*" events and processes them, usually by firing off new events that are handled by the
// appropriate component.

var commandProcessor = (function () {

    var self = {};


    // so that our keyboard shortcuts work in the codeMirror textareas.
    Mousetrap.stopCallback = function () {
        return false
    };

    self.addCommand = function (command) {
        eventBus.on(command.name, command.action);
        if (command.kb) Mousetrap.bind(command.kb, function () {
            eventBus.trigger(command.name);
        });
    };

    return self;

})();

[
    {
        name: "command:worksheet:leaveBack",
        desc: "Move to the previous segment.",
        kb: "ctrl+u",
        action: function () {
            eventBus.trigger("worksheet:leaveBack");
        }
    },
    {
        name: "command:worksheet:leaveForward",
        desc: "Move to the next segment.",
        kb: "ctrl+b",
        action: function () {
            eventBus.trigger("worksheet:leaveForward");
        }
    },
    {
        name: "command:worksheet:delete",
        desc: "Delete the active next segment.",
        kb: "ctrl+y",
        action: function () {
            eventBus.trigger("worksheet:delete");
        }
    },
    {
        name: "command:worksheet:newBelow",
        desc: "Create a new segment below the active segment.",
        kb: "ctrl+m",
        action: function () {
            eventBus.trigger("worksheet:newBelow");
        }
    }
].forEach(commandProcessor.addCommand);
