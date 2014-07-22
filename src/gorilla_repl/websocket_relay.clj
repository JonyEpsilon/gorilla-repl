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
    (println json-data)
    (server/send! channel json-data)))

;; This is a bit confusing, at least to my mind. I think the problem is that I don't really understand how nREPL queues
;; eval messages. You'll notice that the reply handling (last line of this function) is handled in a future. If this
;; processing is done on the main thread it blocks the message processor, and in particular it is not possible to send
;; an interrupt message to kill an eval. However, this seems to introduce its own problem, which is if you then fire
;; multiple eval messages at once, so that some are sent before previous evals finish, then the 'done' messages never
;; show up. This breaks the client. So, the solution that I've got is: include the future here, so that interrupt works,
;; and queue eval messages on the client side so that only one at a time is sent through here.
(defn- process-message
  [channel data]
  (let [parsed-message (assoc (json/parse-string data true) :as-html 1)
        _ (println parsed-message)
        client (nrepl/client @conn Long/MAX_VALUE)
        replies (nrepl/message client parsed-message)]
    ;; send the messages out over the WS connection one-by-one.
    (future (doall (map (partial send-json-over-ws channel) replies)))))

(defn ring-handler
  "This ring handler expects the client to make a websocket connection to the endpoint. It relays messages back and
  forth to an nREPL server. A connection to the nREPL server must have previously been made with 'connect-to-nrepl'.
  Messages are mapped back and forth to JSON as they pass through the relay."
  [request]
  (server/with-channel
    request
    channel
    (server/on-receive channel (partial process-message channel))))