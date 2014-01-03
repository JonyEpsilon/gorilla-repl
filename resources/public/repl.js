$(function () {
    var sendREPLCommand = function (command) {
        $.ajax({
                type: 'POST',
                url: '/repl',
                data: command,
                success: function (data) {
                    if (data) {
                        data.map(processResponses)
                    }
                },
                dataType: 'json'
            }
        )
    };

    var processResponses = function (response) {
        $('#result').append(JSON.stringify(response) + '<br/>')
    };

    setInterval(function () {
        sendREPLCommand({})
    }, 250)

    $('#execute').click(function () {
        sendREPLCommand({'op': 'eval', 'code': $('#command').val()})
    });

});