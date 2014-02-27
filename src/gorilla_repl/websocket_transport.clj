(ns gorilla-repl.websocket-transport
  (:require [org.httpkit.server :as server]
            [clojure.tools.nrepl :as nrepl]
            [clojure.tools.nrepl.server :as nrepl-server]
            [cheshire.core :as json]))

(defonce server (nrepl-server/start-server :port 7888))

(defonce conn (nrepl/connect :port 7888))

(defn send-json-over-ws
  [channel data]
  (server/send! channel (json/generate-string data)))

(defn process-message
  [channel data]
  (let [parsed-message (json/parse-string data true)
        client (nrepl/client conn 1000)
        replies (nrepl/message client parsed-message)]
    (doall (map (partial send-json-over-ws channel) replies))))

(defn ring-handler
  [request]
  (server/with-channel
    request
    channel
    (server/on-receive channel (partial process-message channel))))