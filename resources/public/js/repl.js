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