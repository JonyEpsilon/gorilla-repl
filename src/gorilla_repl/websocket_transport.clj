(ns gorilla-repl.websocket-transport
  (:require [org.httpkit.server :as server]
            [clojure.tools.nrepl.server :as nrepl-server]
            [clojure.tools.nrepl.transport :as transport]))


(defn ring-handler
  [request]
  (let [handler (nrepl-server/default-handler)]
    (server/with-channel
      request
      channel
      (server/on-close channel
                       (fn [status] (println "channel closed: " status)))
      (server/on-receive channel
                         (fn [data]
                           (println data)
                           (nrepl-server/handle* data handler)
                           )))))
