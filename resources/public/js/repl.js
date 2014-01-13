/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

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
        // get a REPL session and store its ID
        startPolling();
    };

    var startPolling = function () {
        setInterval(function () {sendREPLCommand({})}, 500);
    };

    return {
        connect: connect,

        execute: (function (command, id) {
            sendREPLCommand({'op': 'eval', 'code': command, id: id});
        })
    }
})();