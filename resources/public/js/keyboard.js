/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// Keyboard shortcuts

Mousetrap.stopCallback = function () {return false};

Mousetrap.bind("ctrl+n", function () { eventBus.trigger("segment:newBelow") });