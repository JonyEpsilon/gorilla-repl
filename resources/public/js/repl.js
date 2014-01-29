/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// represents the connection to the repl. Currently uses HTTP-based polling.
// TODO: figure out the deal with session IDs.

var repl = (function () {

    var sessionID = null;

    var sendREPLCommand = function (message) {
        $.ajax({
                type: 'POST',
                url: '/repl',
                data: message,
                success: function (data) {
                    if (data) {
                        data.map(function (d) {
                            // try and snuffle the session ID from the message, this should only happen on the first
                            // message
                            if (!sessionID && d.session) {
//                                console.log("Captured session: " + d.session);
                                sessionID = d.session;
                            }
                            // responses are sent out asynchronously as messages on the eventBus
//                            console.log(JSON.stringify(d));
                            eventBus.trigger("repl:response", d);
                        });
                    }
                },
                dataType: 'json'
            }
        )
    };

    var connect = function () {
        startPolling();
    };

    var startPolling = function () {
        setInterval(function () {sendREPLCommand({})}, 500);
    };

    return {
        // connect to the nREPL session
        connect: connect,
        // evaluate some clojure code
        execute: (function (command, id) {
            var message = {'op': 'eval', 'code': command, id: id};
//            if (sessionID) message.session = sessionID;
//            console.log(JSON.stringify(message));
            sendREPLCommand(message);
        })
    }
})();