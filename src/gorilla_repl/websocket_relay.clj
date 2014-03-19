;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

;;; A websocket handler that passes messages back and forth to an already running nREPL server.

(ns gorilla-repl.websocket-relay
  (:require [org.httpkit.server :as server]
            [clojure.tools.nrepl :as nrepl]
            [cheshire.core :as json]))

;; We will open a single connection to the nREPL server for the life of the application. It will be stored here.
(def conn (atom nil))

;; Doing it this way with an atom feels wrong, but I can't figure out how to thread an argument into Compojure's
;; routing macro, so I can't pass the connection around, to give a more functional API.
(defn connect-to-nrepl
  "Connect to the nREPL server and store the connection."
  [port]
  (let [new-conn (nrepl/connect :port port)]
    (swap! conn (fn [x] new-conn))))

(defn- send-json-over-ws
  [channel data]
  (let [json-data (json/generate-string data)]
    #_(println json-data)
    (server/send! channel json-data)))

(defn- process-message
  [channel data]
  (let [parsed-message (assoc (json/parse-string data true) :as-html 1)
        client (nrepl/client @conn Long/MAX_VALUE)
        replies (nrepl/message client parsed-message)]
    ;; send the messages out over the WS connection one-by-one.
    (doall (map (partial send-json-over-ws channel) replies))))

(defn ring-handler
  "This ring handler expects the client to make a websocket connection to the endpoint. It relays messages back and
  forth to an nREPL server. A connection to the nREPL server must have previously been made with 'connect-to-nrepl'.
  Messages are mapped back and forth to JSON as they pass through the relay."
  [request]
  (server/with-channel
    request
    channel
    (server/on-receive channel (partial process-message channel))))