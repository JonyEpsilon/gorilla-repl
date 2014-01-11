/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

var nreplDrawbridgeHandler = function (responseCallback) {

    var sendREPLCommand = function (command) {
        $.ajax({
                type: 'POST',
                url: '/repl',
                data: command,
                success: function (data) {
                    if (data) {
                        data.map(responseCallback)
                    }
                },
                dataType: 'json'
            }
        )
    };

    var startPolling = function () {
        setInterval(function () {sendREPLCommand({})}, 500);
    };

    return {
        connect: startPolling,

        execute: (function (command) {
            sendREPLCommand({'op': 'eval', 'code': command});
        })
    }
};