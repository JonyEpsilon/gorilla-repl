/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// represents the connection to the repl. Currently uses HTTP-based polling.

var repl = (function () {

    var self = {};

    self.sendREPLCommand = function (message) {
        $.ajax({
                type: 'POST',
                url: '/repl',
                data: message,
                success: function (data) {
                    if (data) {
                        data.map(function (d) {
                            // responses are sent out asynchronously as messages on the eventBus
                            //console.log(JSON.stringify(d));
                            eventBus.trigger("repl:response", d);
                        });
                    }
                },
                dataType: 'json'
            }
        )
    };

    self.connect = function (successCallback, failureCallback) {
        // connecting to nREPL seems to be a little awkward. We first issue a session ":clone" command. We don't know
        // when the new-session response will come back, so we have to look out for it in the success handler above, and
        // capture it when it does come back. The user must not be allowed to execute any nREPL commands until this
        // handshake is complete, otherwise the command will be sent without session information. The easiest way to do
        // this, if a little cheezy, is to make two calls here with a delay between them. This makes this function
        // very horrible looking. If we get the session ID on the first of second request, we call the successCallback.
        // If we haven't got it after two requests, we call the failureCallback.
        $.post('/repl', {"op": "clone"}, function (data) {
            // maybe we get it easy, and the new session comes back first time
            if (data[0] && data[0]['new-session']) {
                self.sessionID = data[0]['new-session'];
                self.startPolling();
                successCallback()
            } else {
                // or maybe we need to ask again, some time later
                setTimeout(function () {
                    $.post('/repl', {}, function (data2) {
                        if (data2[0] && data2[0]['new-session']) {
                            self.sessionID = data2[0]['new-session'];
                            self.startPolling();
                            successCallback();
                        } else {
                            console.error('Failed to get session.');
                            failureCallback();
                        }
                    });
                }, 1000); // we wait quite a long time, as the app is dead if the second call doesn't succeed. And it's
            }             // all short compared to the lein startup time ;-)
        });
    };


    self.startPolling = function () {
        setInterval(function () {
            self.sendREPLCommand({session: self.sessionID})
        }, 500);
    };

    self.execute = function (command, id) {
        var message = {'op': 'eval', 'code': command, id: id, session: self.sessionID};
        //console.log(JSON.stringify(message));
        self.sendREPLCommand(message);
    };

    return self;
})();