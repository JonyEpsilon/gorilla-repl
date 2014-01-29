;;;; This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(ns gorilla-repl.core
  (:use compojure.core)
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            [ring.adapter.jetty :as jetty]
            [ring.middleware.keyword-params :as keyword-params]
            [ring.middleware.nested-params :as nested-params]
            [ring.middleware.params :as params]
            [ring.middleware.session :as session]
            [ring.middleware.json :as json]
            [ring.util.response :as res]
            [cemerick.drawbridge :as drawbridge])
  (:gen-class))

;; the handler function for repl requests
(def ^:private drawbridge
  (-> (drawbridge/ring-handler)
      (keyword-params/wrap-keyword-params)
      (nested-params/wrap-nested-params)
      (params/wrap-params)
      (session/wrap-session)))

;; the client side will make an HTTP request at startup to get configuration information. It would be nicer to
;; parameterise the routes as a function of this config. But instead, the configuration information is stored in an atom
;; so as to play nicely with ring, in particular "lein ring server" (which expects the routes for the app to be
;; contained in a var, not made by a function).
(def ^:private config-info
  (atom {:port 8080
         }))

;; the config handler
(defn config
  [req]
  (res/response @config-info))

;; the client can post a request to have the worksheet saved, handled by the following
(defn save
  [req]
  (println "Saved!")
  (res/response {:status "Not implemented!"}))

;; the combined routes - we serve up everything in the "public" directory of resources under "/".
(defroutes app-routes
           (ANY "/repl" {:as req} (drawbridge req))
           (GET "/config" [] (json/wrap-json-response config))
           (POST "/save" [] (json/wrap-json-response save))
           (route/resources "/"))


(defn run-gorilla-server
  [conf]
  (println "Gorilla-REPL starting ...")
  ;; first we look at the configuration, and if requested, load the worksheet
  (when-let [ws (:worksheet conf)]
    ;; if we load a file, we store its filename in the config
    (swap! config-info #(assoc % :worksheet-filename ws))
    ;; load the file itself and put that in the config
    (swap! config-info #(assoc % :worksheet-data (slurp ws))))
  ;; start the app
  (let [p (:port @config-info)
        s (jetty/run-jetty app-routes {:port p :join? false})]
    (println (str "Ready. Running at http://localhost:" p "/worksheet.html ."))
    (println "Ctrl+C to exit.")
    ;; block this thread by joining the server (which should run until killed)
    (.join s)))


(defn -main []
  (run-gorilla-server {:worksheet "ws/example.clj"}))