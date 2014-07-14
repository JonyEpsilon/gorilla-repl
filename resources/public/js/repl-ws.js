/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// A websocket connection to the repl. Works with `gorilla-repl.websocket-relay` on the backend.

var repl = (function () {

    var self = {};

    self.sendREPLCommand = function (message) {
        self.ws.send(JSON.stringify(message));
    };

    // this handles messages coming back from the socket once the connection phase is complete.
    var messageHandler = function (message) {
        var msg = JSON.parse(message.data);
        eventBus.trigger("repl:response", msg);
    };

    // TODO: handle errors.
    self.connect = function (successCallback, failureCallback) {
        // hard to believe we have to do this
        var loc = window.location;
        var url = "ws://" + loc.hostname + ":" + loc.port + "/repl";
        self.ws = new WebSocket(url);

        // we first install a handler that will capture the session id from the clone message. Once it's done its work
        // it will replace the handler with one that handles the rest of the messages, and call the successCallback.
        self.ws.onmessage = function (message) {
            var msg = JSON.parse(message.data);
            if (msg['new-session']) {
                self.sessionID = msg['new-session'];
                self.ws.onmessage = messageHandler;
                successCallback();
            }
        };

        // The first thing we do is send a clone op, to get a new session.
        self.ws.onopen = function () {
            self.ws.send(JSON.stringify({"op": "clone"}));
        };

        // If the websocket connection dies we're done for, message the app to tell it so.
        self.ws.onclose = function () {
            eventBus.trigger("app:connection-lost");
        };
    };

    // The public interface for executing code on the REPL server.
    self.execute = function (command, id) {
        var message = {'op': 'eval', 'code': command, id: id, session: self.sessionID};
        self.sendREPLCommand(message);
    };

    return self;
})();