(defproject gorilla-repl "0.1.0-SNAPSHOT"
  :description "A web-based REPL in the notebook style."
  :url "https://github.com/JonyEpsilon/gorilla-repl"
  :license {:name "MIT"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [ring/ring-jetty-adapter "1.2.1"]
                 [compojure "1.1.6"]
                 [com.cemerick/drawbridge "0.0.6"]]
  :main ^:skip-aot gorilla-repl.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})
