/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// The application entry point
$(function () {

    var worksheet = worksheet();
    var wsWrapper = worksheetWrapper(worksheet);

    ko.applyBindings(wsWrapper);

});