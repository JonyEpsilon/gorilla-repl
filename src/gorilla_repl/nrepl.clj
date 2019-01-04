(ns gorilla-repl.nrepl
  (:require [gorilla-repl.websocket-relay :as ws-relay]
            [nrepl.server :as nrepl-server]
            [nrepl.middleware.pr-values :as pr-values]
            [cider.nrepl :as cider]
            [clojure.java.io :as io]))

(def nrepl (atom nil))

(defn start-and-connect
  ([nrepl-requested-port nrepl-requested-host repl-port-file]
   (let [cider-mw (map resolve cider/cider-middleware)
         middleware (conj cider-mw #'pr-values/pr-values)
         nr (nrepl-server/start-server :port nrepl-requested-port
                                       :bind nrepl-requested-host
                                       :handler (apply nrepl-server/default-handler middleware))
         nrepl-port (:port nr)]
     (println "Started nREPL server on port" nrepl-port)
     (swap! nrepl (fn [x] nr))
     (ws-relay/connect-to-nrepl nrepl-port)
     (spit (doto repl-port-file .deleteOnExit) nrepl-port))))
