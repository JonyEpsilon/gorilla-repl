;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(defproject gorilla-repl "0.3.4"
  :description "A rich REPL for Clojure in the notebook style."
  :url "https://github.com/JonyEpsilon/gorilla-repl"
  :license {:name "MIT"}
  :dependencies ^:replace [[org.clojure/clojure "1.6.0"]
                           [http-kit "2.1.18"]
                           [ring/ring-json "0.3.1"]
                           [cheshire "5.3.1"]
                           [compojure "1.1.8"]
                           [org.slf4j/slf4j-api "1.7.7"]
                           [ch.qos.logback/logback-classic "1.1.2"]
                           [gorilla-renderable "1.0.0"]
                           [org.clojure/data.codec "0.1.0"]
                           [javax.servlet/servlet-api "2.5"]
                           [grimradical/clj-semver "0.2.0" :exclusions [org.clojure/clojure]]
                           [cider/cider-nrepl "0.8.1"]
                           [org.clojure/tools.nrepl "0.2.3"]
                           [clojure-complete "0.2.3"]]
  :main ^:skip-aot gorilla-repl.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})
