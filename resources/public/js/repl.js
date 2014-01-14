/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// represents the connection to the repl. Currently uses HTTP-based polling.
// TODO: figure out the deal with session IDs.

var repl = (function () {

    var sendREPLCommand = function (message) {
        $.ajax({
                type: 'POST',
                url: '/repl',
                data: message,
                success: function (data) {
                    if (data) {
                        data.map(function (d) {
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
            sendREPLCommand({'op': 'eval', 'code': command, id: id});
        })
    }
})();