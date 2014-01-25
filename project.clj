;;;; This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(defproject gorilla-repl "0.1.0-SNAPSHOT"
  :description "A web-based REPL in the notebook style."
  :url "https://github.com/JonyEpsilon/gorilla-repl"
  :license {:name "MIT"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [ring/ring-jetty-adapter "1.2.1"]
                 [compojure "1.1.6"]
                 [com.cemerick/drawbridge "0.0.6"]
                 [org.slf4j/slf4j-api "1.7.5"]
                 [ch.qos.logback/logback-classic "1.0.13"]]
  :main ^:skip-aot gorilla-repl.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})
