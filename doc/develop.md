# Information for developers

This note has some information about the way git branches are used, and some hints to try and avoid ballsing up the
release process.

## Git branches



## To start a new release

Make sure you're working on the develop branch. Change the version numbers to a SNAPSHOT version in:

- project.clj of gorilla-repl, gorilla-plot.
- project.clj of lein-gorilla.
- dependency injection code in core namespace of lein-gorilla.
- README of gorilla-repl.


## To publish a release

