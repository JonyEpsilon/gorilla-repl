# Changelog

## Version 0.3.?

- Renderer handles Cons sequences correctly.
- Change default Linux command key to alt.
- Add code to support online viewer.
- View images with `image-view` (thanks to @scottdw).
- Plots don't always include (0,0).
- Renderer for [loom](https://github.com/aysylu/loom) graphs https://github.com/JonyEpsilon/loom-gorilla .
- Incanter integration https://github.com/JonyEpsilon/loom-gorilla .

### Breaking changes

- Vega data now uses keywords rather than strings as keys (thanks to @cldellow). This will break any functions written
  to directly manipulate Vega structures. Value copy of Vega structures from old worksheets will also break.

## Version 0.2.0

- All new renderer. This is the main change. The new renderer is simple and predictable, _very_ flexible, supports
  first-class pluggable custom rendering, and really respects the structure of Clojure values. In particular it renders
  aggregates of values as you might hope, so you can draw lists of tables, tables of plots, associatives of tables of
  tables of plots etc.

- You can open multiple tabs on the same REPL. This works really nicely - they each get they own session, but share the
  REPL.

- Runs a real nREPL server now, so should work together with things like vim-fireplace that make their own connection
  to the REPL server. (I haven't tested this though!)

- As you might have guessed from the above, there's now a website. http://gorilla-repl.org

- Numerous small bug-fixes and feature requests.

### Breaking changes

- Old worksheets will need to be re-run to regenerate their output.

- Code that dabbled with the internals of gorilla-plot might need to be adjusted.


## Version 0.1.2

Initial public release.