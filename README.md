# Gorilla REPL
This is a modified version of Gorilla, a rich REPL for Clojure in the notebook style. If you're interested in the original version, you should take a look at its [website](http://gorilla-repl.org). This version adds the ability to open any Clojure file in Gorilla REPL, as well as to save a worksheet
without Gorilla markup to allow for easy collaboration.

Secrets of Gorilla REPL
=======================
via Lee Spector (lspector@hampshire.edu), revised October 19, 2016

----
This document provides tips on using the combination of Leiningen (<http://leiningen.org>) and Gorilla REPL (<http://gorilla-repl.org>) **as a complete Clojure programming environment**. Please note that such usage is not the intended goal of Gorilla REPL, as articulated by its author, Jony Hudson. But in some contexts you may find that it makes a great programming environment nonetheless.

This document directs you to use a version of Jony Hudson's awesome Gorilla REPL system with additions made by Ben Bailey. The key features added by Ben are:

- Open any `.clj`, `.cljs`, `.cljc`, or `.hl` file. If the file does not already have Gorilla REPL worksheet markup, it will appear as a worksheet with the entire contents of the file in a single input cell.

- Save a worksheet without Gorilla REPL worksheet markup. This will save only the text in the worksheet's input areas. Note that this, in conjunction with the first feature listed above, allows you to use Gorilla REPL to open, edit, and save any Clojure file, without introducing unwanted markup.

- Use a leiningen template to easily create a new Clojure project using the `app` template (allowing it to be run from a command line with `lein run`) and also including a dependency to the proper version of the Gorilla REPL plugin.

**To make a project:**
If you have leiningen installed and you want to create a project called `foo`, for which you can use Gorilla REPL as your development environment, then `cd` into the directory where you want it to live and type:

```
lein new gorilla-app foo
```

This will create a project that uses both the `app` template (which will set things up so that `lein run` will run the `-main` function in `src/foo/core.clj`) and also the recommended version of the Gorilla REPL plugin.

After creating the project you can do:

```
cd foo
lein gorilla
```

and open the URL that this prints in your browser to begin working on your project. It will give you a fresh, unsaved worksheet initially, but you can use the "Load a worksheet" command (choose from the menu or type `ctrl+g ctrl+l`) to open and edit the `core.clj` file or any other Clojure file in your project.

---

**To add a new file (and namespace) to your project:**
If your project is called `foo` then your code should all live in the `src/foo` folder within your `foo` folder. So if you want to have a file of code called `bar.clj` then it should be saved as `src/foo/bar.clj`. The namespace defined by this file should be `foo.bar`, and that is what should appear in the `ns` expression at the top of the file. This correspondence of names is what will allow Clojure to find the file when you use or require the `foo.bar` namespace in other code.

You can create this file in a variety of ways, including these:

- Make a copy of your `core.clj` file (however you make copies of files on your computer), rename it to `bar.clj`, and then change the namespace name in the `ns` expression (which you could do with Gorilla REPL itself, or any text editor).

- In Gorilla REPL, after saving your current worksheet so that you don't lose it, use the "Reset the worksheet - a fresh start" command (in the Gorilla REPL menu) to get a fresh worksheet. Then change the name of the namespace (for example to `foo.bar`) and save it with the right name (for example `src/foo/bar.clj`).

Once you have done this you can write code in the new file, and use that code elsewhere. For example, if you create namespace `foo.bar`, as described above, and define a function in that file, and save it, then in your `core.clj` file you can say `(use 'foo.bar)` and then the function that you defined will be available.


---

**To enable Gorilla REPL for an existing leiningen project:**
Add this line to the `defproject` call in your `project.clj`:


```
  :plugins [[org.clojars.benfb/lein-gorilla "0.4.0"]]
```

---

**When saving a worksheet:**
Always give it a name ending in `.clj`, `.cljs`, `.cljc`, or `.hl`. Otherwise Gorilla REPL won't see it when you later try to load it.

To save the worksheet without the Gorilla REPL worksheet markup, select "Save the worksheet without markup." from the Gorilla REPL menu or type `ctrl+g ctrl+w`. Note that this will overwrite the file, so if you want to preserve a version with the markup then you should make a copy of the file before you do this.

---

**To auto-reindent a selection:**
Shift-Tab

---

**To kill a long-running process:**
No good way. Kill the server at the command line and start over.

---

## Contributing
Contributions, in the form of comments, criticism, bug reports, or code are all very welcome :-) If you've got an idea for a big change drop me an email so we can coordinate work.

## License
Gorilla is licensed to you under the MIT license. See LICENSE.txt for details.

Copyright © 2014- Jony Hudson and contributors
