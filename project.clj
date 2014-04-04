;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(defproject gorilla-repl "0.3.1-SNAPSHOT"
  :description "A rich REPL for Clojure in the notebook style."
  :url "https://github.com/JonyEpsilon/gorilla-repl"
  :license {:name "MIT"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [http-kit "2.1.16"]
                 [ring/ring-json "0.2.0"]
                 [cheshire "5.0.2"]
                 [compojure "1.1.6"]
                 [org.slf4j/slf4j-api "1.7.5"]
                 [ch.qos.logback/logback-classic "1.0.13"]
                 [clojure-complete "0.2.3"]
                 [gorilla-renderable "1.0.0"]
                 [hiccup "1.0.5"]
                 [instaparse "1.3.1"]
                 [markdown-clj "0.9.41"]
                 [org.clojure/data.codec "0.1.0"]]
  :main ^:skip-aot gorilla-repl.core
  :target-path "target/%s"
  :plugins [[lein-ring "0.8.7"]]
  :ring {:handler gorilla-repl.core/app-routes}
  :profiles {:uberjar {:aot :all}})
