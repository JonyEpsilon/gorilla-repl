;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(defproject gorilla-repl "0.4.0-SNAPSHOT"
  :description "A rich REPL for Clojure in the notebook style."
  :url "https://github.com/JonyEpsilon/gorilla-repl"
  :license {:name "MIT"}
  :dependencies ^:replace [[org.clojure/clojure "1.6.0"]
                           [org.clojure/tools.cli "0.3.1"]
                           [http-kit "2.1.18"]
                           [ring/ring-json "0.3.1"]
                           [cheshire "5.3.1"]
                           [compojure "1.1.8"]
                           [org.slf4j/slf4j-api "1.7.7"]
                           [ch.qos.logback/logback-classic "1.1.2"]
                           [org.clojure/tools.logging "0.3.1"]
                           [gorilla-renderable "2.0.0"]
                           [gorilla-plot "0.1.3"]
                           [javax.servlet/servlet-api "2.5"]
                           [grimradical/clj-semver "0.2.0" :exclusions [org.clojure/clojure]]
                           [cider/cider-nrepl "0.9.1"]
                           [org.clojure/tools.nrepl "0.2.10"]]
  :main gorilla-repl.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})


;; Run using

;;   lein run -p 7999

;; to connect to an existing nrepl server.