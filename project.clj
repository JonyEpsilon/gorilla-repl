;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(defproject org.clojars.benfb/gorilla-repl "0.5.0-SNAPSHOT"
  :description "A rich REPL for Clojure in the notebook style."
  :url "https://github.com/benfb/gorilla-repl"
  :license {:name "MIT"}
  :dependencies ^:replace [[org.clojure/clojure "1.9.0"]
                           [http-kit "2.3.0" :exclusions [ring/ring-core]]
                           [ring/ring-json "0.4.0" :exclusions [org.clojure/clojure]]
                           [cheshire "5.8.1"]
                           [compojure "1.6.1" :exclusions [ring/ring-core ring/ring-json] ]
                           [ch.qos.logback/logback-classic "1.2.3"]
                           [gorilla-renderable "2.0.0"]
                           [gorilla-plot "0.1.4" :exclusions [org.clojure/clojure]]
                           [grimradical/clj-semver "0.2.0" :exclusions [org.clojure/clojure]]
                           [cider/cider-nrepl "0.18.0" :exclusions [org.clojure/clojure]]
                           [nrepl/nrepl "0.5.0-SNAPSHOT"]]
  :main ^:skip-aot gorilla-repl.core
  :target-path "target/%s"
  :jvm-opts ~(let [version    (System/getProperty "java.version")
                  [major _ _] (clojure.string/split version #"\.")]
               (if (>= (java.lang.Integer/parseInt major) 9)
                 ["--add-modules" "java.xml.bind"]
                 []))
  :release-tasks [["vcs" "assert-committed"]
                  ["change" "version" "leiningen.release/bump-version" "release"]
                  ["vcs" "commit"]
                  ["vcs" "tag" "v" "--no-sign"]
                  ["deploy"]
                  ["change" "version" "leiningen.release/bump-version"]
                  ["vcs" "commit"]
                  ["vcs" "push"]]
  :deploy-repositories {"releases" {:url "https://repo.clojars.org" :username :env :password :env :sign-releases false}})
