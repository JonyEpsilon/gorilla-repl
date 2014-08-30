(ns gorilla-repl.nrepl
  (:require [gorilla-repl.websocket-relay :as ws-relay]
            [clojure.tools.nrepl.server :as nrepl-server]
            [gorilla-repl.render-values-mw :as render-mw] ;; it's essential this import comes after the previous one! It
                                                          ;; refers directly to a var in nrepl (as a hack to workaround
                                                          ;; a weakness in nREPL's middleware resolution).
            [cider.nrepl :as cider]
            [clojure.java.io :as io]))

(def nrepl (atom nil))

(defn start-and-connect
  [nrepl-requested-port]
  (let [cider-mw (map resolve cider/cider-middleware)
        middleware (conj cider-mw #'render-mw/render-values)
        nr (nrepl-server/start-server :port nrepl-requested-port
                                      :handler (apply nrepl-server/default-handler middleware))
        nrepl-port (:port nr)
        repl-port-file (io/file ".nrepl-port")]
    (println "Started nREPL server on port" nrepl-port)
    (swap! nrepl (fn [x] nr))
    (ws-relay/connect-to-nrepl nrepl-port)
    (spit (doto repl-port-file .deleteOnExit) nrepl-port)))
