$(function () {

    var handleResponse = function (response) {
        $('#result').append(JSON.stringify(response) + '<br/>')
    };

    var repl = nreplDrawbridgeHandler(handleResponse)

    $('#execute').click(function () {
        repl.execute($('#command').val())
    });

    setInterval(repl.poll, 250)

});