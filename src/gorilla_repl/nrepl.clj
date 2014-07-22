(ns gorilla-repl.nrepl
  (:require [gorilla-repl.websocket-relay :as ws-relay]
            [clojure.tools.nrepl.server :as nrepl-server]
            [gorilla-repl.render-values-mw :as render-mw] ;; it's essential this import comes after the previous one! It
                                                          ;; refers directly to a var in nrepl (as a hack to workaround
                                                          ;; a weakness in nREPL's middleware resolution).
            [clojure.java.io :as io]))

(def nrepl (atom nil))

(defn start-and-connect
  [nrepl-requested-port]
  (let [nr (nrepl-server/start-server :port nrepl-requested-port
                                      :handler (nrepl-server/default-handler #'render-mw/render-values))
        nrepl-port (:port nr)
        repl-port-file (io/file ".nrepl-port")]
    (println "Started nREPL server on port" nrepl-port)
    (swap! nrepl (fn [x] nr))
    (ws-relay/connect-to-nrepl nrepl-port)
    (spit (doto repl-port-file .deleteOnExit) nrepl-port)))
