# Changelog

## Version 0.3.5

- Generate a main class to ease usage in Java projects.
- Viewer properly supports non-ASCII text.
- Update to support CIDER-nrepl version 0.9.1.
- Large worksheets (>8MB) now save successfully.
- Can view worksheets hosted on BitBucket (thanks for @tbrx).
- Command to delete output from the worksheet (thanks to @dasmoth).

## Version 0.3.4

- Keeping up with the Batsovs. Support CIDER version 0.8.1.
- Cute favicon (thanks to @ticking and @ivan-kleshnin)
- Serve up project files so they can be accessed from markdown code.
- Switch to marked markdown renderer. Now supports tables.
- "Save as..." command (thanks to @jococo). 
- Running without a 'net connection doesn't crash the app.
- Show all output from segments with multiple top-level forms.
- Improvements to stylesheet for printing (thanks to @kurtharriger).
- Wrap long text lines in output.
- Fix a bug in scrolling long segments.
- Display bound IP on startup (thanks to @ticking).
- Fix dependency problem to allow use of Gorilla without Leiningen (thanks to @stuarthalloway).

## Version 0.3.3

- Look up symbol in ClojureDocs.
- Inline documentation in auto-complete.
- Much better auto-complete, thanks to compliment and cider-nrepl.
- Autoselects a free port by default.
- Upgrade to CodeMirror 4.5.
- Interoperable with Emacs/CIDER > v.0.7.0 i.e. auto-adds cider-nrepl middleware.
- Hopefully fix an odd intermittent dependency bug (thanks to @jococo).
- App routes now a var for easier hacking on the server (thanks to @ticking).
- Write out web-app port to file on startup to enable other tools to interoperate.
- Fix version range warning.

## Version 0.3.2

- Disallow non-local connections by default. Gorilla sessions are now safe by default, even when the firewall allows
  access to Gorilla's port (thanks to @silasdavis and @foogoof).
- Change bracket match highlighting to improve visibility.

## Version 0.3.1

- Generate suggested ns declaration in new file (thanks to @gfredericks and @modellurgist).
- Fix a bug when outputting 'list-like' values.
- Fix a bug with record type output.
- Command to re-evaluate all code in a worksheet.
- Configurable keymap.
- Get rid of standalone mode: you now always run Gorilla from inside a project. Makes a number of things more
  consistent.
- Command to reset worksheet.
- Project is shown in title bar. Makes it easier to work with multiple Gorilla sessions.
- Prints a message if a newer version is available.
- URL shows filename, and can load worksheet from URL (thanks to @gfredericks and @modellurgist).
- New UI for commands and loading files. Mouse-friendly, small-screen friendlier, and generally less shoddy.
- Renderer handles Cons sequences correctly.
- Change default Linux command key to alt.
- Add code to support online viewer.
- View images with `image-view` (thanks to @scottdw).
- Plots now don't always include (0,0).
- Renderer for [loom](https://github.com/aysylu/loom) graphs https://github.com/JonyEpsilon/loom-gorilla .
- Incanter integration https://github.com/JonyEpsilon/incanter-gorilla .

### Breaking changes

- Vega data now uses keywords rather than strings as keys (thanks to @cldellow). This will break any functions written
  to directly manipulate Vega structures. Value copy of Vega structures from old worksheets will also break.
- Change the gorilla-plot.core/histogram option fillOpacity to fill-opacity.

## Version 0.2.0

- All new renderer. This is the main change. The new renderer is simple and predictable, _very_ flexible, supports
  first-class pluggable custom rendering, and really respects the structure of Clojure values. In particular it renders
  aggregates of values as you might hope, so you can draw lists of tables, tables of plots, associatives of tables of
  tables of plots etc.
- You can open multiple tabs on the same REPL. This works really nicely - they each get they own session, but share the
  REPL.
- Runs a real nREPL server now, so should work together with things like vim-fireplace that make their own connection
  to the REPL server. (I haven't tested this though!)
- There's now a website. http://gorilla-repl.org
- Numerous small bug-fixes and feature requests.

### Breaking changes

- Old worksheets will need to be re-run to regenerate their output.
- Code that dabbled with the internals of gorilla-plot might need to be adjusted.


## Version 0.1.2

Initial public release.