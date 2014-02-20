;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
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
            [cemerick.drawbridge :as drawbridge]
            [complete.core :as complete])
  (:gen-class))

;; useful for debugging the nREPL requests
(defn print-req
  [handler]
  (fn [request]
    (println (:params request))
    (handler request)))

;; a wrapper for JSON API calls
(defn wrap-api-handler
  [handler]
  (-> handler
      (keyword-params/wrap-keyword-params)
      (params/wrap-params)
      (json/wrap-json-response)))

;; the handler function for repl requests
(def ^:private drawbridge
  (-> (drawbridge/ring-handler)
      #_(print-req)
      (keyword-params/wrap-keyword-params)
      (nested-params/wrap-nested-params)
      (params/wrap-params)
      (session/wrap-session)))


;; the worksheet load handler
(defn load-worksheet
  [req]
  ;; TODO: S'pose some error handling here wouldn't be such a bad thing
  (when-let [ws-file (:worksheet-filename (:params req))]
    (let [_ (print (str "Loading: " ws-file " ... "))
          ws-data (slurp (str ws-file) :encoding "UTF-8")
          _ (println "done.")]
      (res/response {:worksheet-data ws-data}))))


;; the client can post a request to have the worksheet saved, handled by the following
(defn save
  [req]
  ;; TODO: error handling!
  (when-let [ws-data (:worksheet-data (:params req))]
    (when-let [ws-file (:worksheet-filename (:params req))]
      (print (str "Saving: " ws-file " ... "))
      (spit ws-file ws-data)
      (println (str "done. [" (java.util.Date.) "]"))
      (res/response {:status "ok"}))))


;; API endpoint for getting completions
(defn completions
  [req]
  (when-let [stub (:stub (:params req))]
    (when-let [ns (:ns (:params req))]
      (res/response {:completions (complete/completions stub (symbol ns))}))))

;; the combined routes - we serve up everything in the "public" directory of resources under "/".
(defroutes app-routes
           (ANY "/repl" {:as req} (drawbridge req))
           (GET "/load" [] (wrap-api-handler load-worksheet))
           (POST "/save" [] (wrap-api-handler save))
           (GET "/completions" [] (wrap-api-handler completions))
           (route/resources "/"))

(defn browse!
  "Open a URL string in a desktop web browser."
  [s]
  (.browse (java.awt.Desktop/getDesktop)
           (java.net.URI. s)))

(defn run-gorilla-server
  [conf]
  (println "Gorilla-REPL.")
  ;; start the app
  (let [p (or (:port conf) 8990)
        s (jetty/run-jetty app-routes {:port p :join? false})
        url (str "http://localhost:" p "/worksheet.html")]
    (browse! url)
    (println "Running at" url)
    (println "Ctrl+C to exit.")
    ;; block this thread by joining the server (which should run until killed)
    (.join s)))

(defn -main
  [& args]
  (run-gorilla-server {}))
