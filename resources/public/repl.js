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

    return {
        execute: function (command) {
            sendREPLCommand({'op': 'eval', 'code': command});
        },
        poll: function () {
            sendREPLCommand({})
        }
    }
};