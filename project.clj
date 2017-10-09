;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(defproject gorilla-repl "0.4.1"
  :description "A rich REPL for Clojure in the notebook style."
  :url "https://github.com/JonyEpsilon/gorilla-repl"
  :license {:name "MIT"}
  :dependencies ^:replace [[org.clojure/clojure "1.9.0-beta2"]
                           [http-kit "2.2.0" :exclusions [ring/ring-core]]
                           [ring/ring-json "0.5.0-beta1" :exclusions [org.clojure/clojure]]
                           [cheshire "5.7.1"]
                           [compojure "1.6.0" :exclusions [ring/ring-core ring/ring-json]]
                           [org.slf4j/slf4j-api "1.7.25"]
                           [ch.qos.logback/logback-classic "1.2.3"]
                           [gorilla-renderable "2.0.0"]
                           [gorilla-plot "0.1.4" :exclusions [org.clojure/clojure]]
                           [grimradical/clj-semver "0.2.0" :exclusions [org.clojure/clojure]]
                           [cider/cider-nrepl "0.15.1" :exclusions [org.clojure/clojure]]
                           [org.clojure/tools.nrepl "0.2.13"]]
  :main ^:skip-aot gorilla-repl.core
  :target-path "target/%s")
