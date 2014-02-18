(ns gorilla-repl.websocket-transport
  (:require [org.httpkit.server :as server]
            [clojure.tools.nrepl.server :as nrepl-server]
            [clojure.tools.nrepl.transport :as transport]
            [cheshire.core :as json]))

(defn send-json-over-ws
  [channel data]
  (println "Sent:" data)
  (server/send! channel (json/generate-string data)))


(def handler (nrepl-server/default-handler))

(defn process-message
  [transport data]
  (println "Received:" data)
  (let [parsed-message (json/parse-string data true)]
    (nrepl-server/handle* parsed-message handler transport)))


(defn ring-handler
  [request]
  (server/with-channel
    request
    channel
    (let [transport (transport/fn-transport nil (partial send-json-over-ws channel))]
      (server/on-receive channel (partial process-message transport)))))
