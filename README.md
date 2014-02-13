# Gorilla REPL

Gorilla is a rich REPL for Clojure in the notebook style. What does that mean? Well, maybe it's best to take a look at
a short video showing you what it can do:

Video here.

You can think of it like a pretty REPL that can plot graphs, or you can think of it as an editor for rich documents that
can contain interactive Clojure code, graphs, table, notes, LaTeX formulae - whatever works for you! One of the main
aims is to make it lightweight enough that you can use it day-to-day instead of the command-line REPL, but also offer
the power to perform and document complex data analysis and modelling tasks. Above all else, Gorilla tries not to
dictate your workflow, but rather to fit in to the way you like to work, hopefully putting a bit more power to your
elbow.

Screenshots here.


# Installation

The rest of these docs assume that you're familiar with the basics of Clojure, and have a working copy of Leiningen
(version > 2) installed. If you're not familiar with Leiningen then you should head over to
(the Leiningen website)[http://leiningen.org] and get it installed first. It's a really nice tool that makes things very
easy!

Gorilla is packaged as a Leiningen plugin. To use Gorilla you can do one of two things. If you just want to use Gorilla
in a particular project, then add the following to the :plugins section of that project's `project.clj` file:
```
[lein-gorilla "0.1.0-SNAPSHOT"]
```
Your completed `project.clj` file might look something like this:
```
(defproject gorilla-test "0.1.0-SNAPSHOT"
  :description "A test project for the Gorilla REPL."
  :dependencies [[org.clojure/clojure "1.5.1"]]
  :main ^:skip-aot gorilla-test.core
  :target-path "target/%s"
  :plugins [[lein-gorilla "0.1.0-SNAPSHOT"]]
  :profiles {:uberjar {:aot :all}})
```
The other way to use Gorilla is to add it to your Leiningen user profile - this will make it available everywhere, even
outside of Leiningen projects. Your `~/.lein/project.clj` might look like:
```
{ :user {
    :plugins [[lein-gorilla "0.1.0-SNAPSHOT"]]
  }
}
```

That's it. You should now be able to run `lein gorilla` and get started.


# Usage

When you run `lein gorilla` it will start up the REPL server, and print a web-link to the console. Point your
web-browser at this link to get going (hint for Mac users: try ctrl-clicking the link). You can open as many browser
windows as you like with this link, each will get its own nREPL session to work in, but share the same nREPL instance
(in case you're not familiar with nREPL's terminology, this means all windows will share definitions etc, but each
window will separately keep track of which namespace you're working in - try it, you'll see it's quite natural).

Once you've got a web-browser pointed at Gorilla you can use it just like a REPL. Type some clojure code in, and hit
shift+Enter to evaluate it. The results are displayed below the code, along with any console output or errors that were
generated.

## Plotting graphs

## Worksheet files

You can save the contents of a window to a 'worksheet' file. This will include everything you see, the code, the output,
notes and mathematics, the lot. A neat feature is that these worksheet files are just plain Clojure files with some
magic comments. This means it's really easy to interactively develop your code in Gorilla, and then move it into

## doc, source and other REPL commands

You might be used to using `doc` and `source` at the command-line REPL. By default these are not imported into the
`user` namespace when Gorilla starts, but if you'd like to use them then you just need to run `(use 'clojure.repl)` to
bring them into scope.

Gorilla provides a few repl commands of its own. Again, these are not imported by default ... TODO.

## Content types

Copyright © 2014- Jony Hudson
