/*
 * This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// A websocket connection to the repl. Works with `gorilla-repl.websocket-relay` on the backend.
// This code also keeps track of running evaluations and dispatches responses to the appropriate worksheet segments.

var repl = (function () {

    var self = {};

    // This is exposed to make it easy to test direct interaction with the nREPL server from the dev tools. It
    // shouldn't be considered part of the public API
    self.sendREPLCommand = function (message) {
        self.ws.send(JSON.stringify(message));
    };

    // the function that deals with pinging the server which serves as
    // (1) keep-alive and (2) a way to piggyback pushes from the server on the ping
    self.pinger = function () {};

    // Connect to the websocket nREPL bridge.
    // TODO: handle errors.
    self.connect = function (successCallback, failureCallback) {
        // hard to believe we have to do this
        var loc = window.location;
        var protocol = window.location.protocol == "https:" ? "wss:" : "ws:";
        var url = protocol + "//" + loc.hostname + ":" + loc.port +
            /^.*\//.exec(loc.pathname)[0] +"repl";
        self.ws = new WebSocket(url);

        // we first install a handler that will capture the session id from the clone message. Once it's done its work
        // it will replace the handler with one that handles the rest of the messages, and call the successCallback.
        self.ws.onmessage = function (message) {
            var msg = JSON.parse(message.data);
            if (msg['new-session']) {
                self.sessionID = msg['new-session'];
                self.ws.onmessage = handleMessage;
                successCallback();
            }
        };

        // The first thing we do is send a clone op, to get a new session.
        self.ws.onopen = function () {
            // we're got an open web socket... proceed with pinging
            self.pinger = function () {
                if (self.sessionID) {
                    var id = UUID.generate();
                    self.ws.send(JSON.stringify({"op": "ping",
                                                 id: id,
                                                 "session": self.sessionID}));
                }

                setTimeout(function() {self.pinger();}, 1000);
            };
            self.pinger();
            self.ws.send(JSON.stringify({"op": "clone"}));
        };

        // If the websocket connection dies we're done for, message the app to tell it so.
        self.ws.onclose = function () {
            self.pinger = function () {};
            eventBus.trigger("app:connection-lost");
        };
    };

    // This maps evaluation IDs to the IDs of the segment that initiated them.
    var evaluationMap = {};

    // tracks the namespace that the last evaluation completed in
    self.currentNamespace = "user";

    // The public interface for executing code on the REPL server.
    self.beginEvaluation = function (d) {
        // generate an ID to tie the evaluation to its results - when responses are received, we route them to the
        // originating segment for display using this ID (see the repl:response event handler below).
        var id = UUID.generate();
        // store the evaluation ID and the segment ID in the evaluationMap
        evaluationMap[id] = d.segmentID;

        // include the segmentID in the message so data can be pushed to
        // the segment in the future
        var message = {'op': 'eval', 'segmentID': d.segmentID,
                       'code': d.code, id: id, session: self.sessionID};
        self.sendREPLCommand(message);
    };

    // as well as eval messages, we also send CIDER messages to the nREPL server for things like autocomplete,
    // docs etc. These are handled by the cider-nrepl middleware. We maintain a separate map which maps the ID of the
    // CIDER message to the callback function that we'd like to run on the returned data.
    var ciderMessageMap = {};

    // send a CIDER message, and schedule the given callback to run on completion. An ID and the session information
    // will be added to the message,
    var sendCIDERMessage = function (msg, callback) {
        var id = UUID.generate();
        ciderMessageMap[id] = callback;
        msg.id = id;
        msg.session = self.sessionID;
        self.sendREPLCommand(msg);
    };

    // query the REPL server for autocompletion suggestions. Relies on the cider-nrepl middleware.
    // We call the given callback with the list of symbols once the REPL server replies.
    self.getCompletions = function (symbol, ns, context, callback) {
        sendCIDERMessage({op: "complete", symbol: symbol, ns: ns, context: context}, function (d) {
            callback(d.completions);
        });
    };

    // queries the REPL server for docs for the given symbol. Relies on the cider-nrepl middleware.
    // Calls back with the documentation text.
    self.getCompletionDoc = function (symbol, ns, callback) {
        sendCIDERMessage({op: "complete-doc", symbol: symbol, ns: ns}, function (d) {
            callback(d["completion-doc"]);
        })
    };

    // resolve a symbol to get its namespace takes the symbol and the namespace that should be used as context.
    // Relies on the cider-nrepl middleware. Calls back with the symbol and the symbol's namespace
    self.resolveSymbol = function (symbol, ns, callback) {
        sendCIDERMessage({op: "info", symbol: symbol, ns: ns}, function (d) {
            callback({symbol: d.value.name, ns: d.value.ns});
        })
    };

    // handle the various different nREPL responses
    var handleMessage = function (message) {
        var d = JSON.parse(message.data);

        // Is this a message relating to an evaluation triggered by the user?
        var segID = d.segmentID || evaluationMap[d.id];
        if (segID != null) {

            // - evaluation result (Hopefully no other responses have an ns component!)
            if (d.ns) {
                self.currentNamespace = d.ns;
                eventBus.trigger("evaluator:value-response", {clear: d.clear, ns: d.ns, value: d.value, segmentID: segID});
                return;
            }

            // - console output
            if (d.out) {
                eventBus.trigger("evaluator:console-response", {out: d.out, segmentID: segID});
                return;
            }

            // - status response
            if (d.status) {
                // is this an evaluation done message
                if (d.status.indexOf("done") >= 0) {
                    eventBus.trigger("evaluator:done-response", {segmentID: segID});
                    // keep the evaluation map clean
                    delete evaluationMap[d.id];
                    return;
                }
            }

            // - error message
            if (d.err) {
                eventBus.trigger("evaluator:error-response", {error: d.err, segmentID: segID});
                return;
            }

            // - root-ex message
            if (d['root-ex']) {
                // at the minute we just eat (and log) these - I'm not really sure what they're for!
                console.log("Root-ex message: " + JSON.stringify(d));
                return;
            }
        }

        // If this reply isn't associated with a segment, then it's probably a reply to a CIDER message
        if (ciderMessageMap[d.id]) {
            // if the message has an associated callback, then fire it
            ciderMessageMap[d.id](d);
            // if it contains a status "done" message, clean up the service map
            if (d.status) {
                if (d.status.indexOf("done") >= 0) {
                    delete ciderMessageMap[d.id];
                    return;
                }
            }

            return;
        }


        // If we get here, then we don't know what the message was for - just log it
        // unless the message is explicitly set as ignore
        if (!d.ignore && (!d.status || d.status.indexOf("done") < 0)) {
            console.log("Unknown response: " + JSON.stringify(d));
        }
    };


    return self;
})();
