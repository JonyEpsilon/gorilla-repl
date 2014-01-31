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
            [cemerick.drawbridge :as drawbridge]
            [clojure.tools.cli :refer [parse-opts]])
  (:gen-class))

;; useful for debugging the nREPL requests
(defn print-req
  [handler]
  (fn [request]
    (println (:params request))
    (handler request)))

;; the handler function for repl requests
(def ^:private drawbridge
  (-> (drawbridge/ring-handler)
      #_(print-req)
      (keyword-params/wrap-keyword-params)
      (nested-params/wrap-nested-params)
      (params/wrap-params)
      (session/wrap-session)))

;; the client side will make an HTTP request at startup to get configuration information. It would be nicer to
;; parameterise the routes as a function of this config. But instead, the configuration information is stored in an atom
;; so as to play nicely with ring, in particular "lein ring server" (which expects the routes for the app to be
;; contained in a var, not made by a function).
(def ^:private config-info
  (atom {
          :port          8080
          :worksheet-dir "ws/"
          }))

;; the config handler
(defn config
  [req]
  ;; load the worksheet whenever config is requested, this ensures that if the page is reloaded, the latest copy of the
  ;; worksheet is returned.
  ;; TODO: S'pose some error handling here wouldn't be such a bad thing
  ;; TODO: maybe better for this to be its own API endpoint
  (when-let [ws (:worksheet-filename @config-info)]
    (print (str "Loading: " ws " ... "))
    (swap! config-info #(assoc % :worksheet-data (slurp (str (:worksheet-dir @config-info) ws))))
    (println "done."))
  (res/response @config-info))

;; the client can post a request to have the worksheet saved, handled by the following
(defn save
  [req]
  (let [ws-data (:worksheet-data (:params req))]
    ;; do we have a file for this worksheet already?
    (if-let [ws (:worksheet-filename @config-info)]
      ;; if so, save to that file
      (do
        (print (str "Saving: " ws " ... "))
        (spit (str (:worksheet-dir @config-info) ws) ws-data)
        (println "done.")
        (res/response {:status "ok"}))
      ;; else, create a new file and save in to that
      (do
        (println "Creating new worksheet.")
        ;; slightly cheezy use of createTempFile - makes the code a bit ugly, but works ok
        (let [f (java.io.File/createTempFile "tmp" ".clj" (java.io.File. (:worksheet-dir @config-info)))
              tmp-filename (.getName f)]
          (print (str "Saving: " tmp-filename " ... "))
          (spit (str (:worksheet-dir @config-info) tmp-filename) ws-data)
          (println "done.")
          (swap! config-info #(assoc % :worksheet-filename tmp-filename))
          (res/response {:status "ok" :filename tmp-filename}))))))

(def ^:private save-handler
  (-> save
      (keyword-params/wrap-keyword-params)
      (params/wrap-params)))

;; the combined routes - we serve up everything in the "public" directory of resources under "/".
(defroutes app-routes
           (ANY "/repl" {:as req} (drawbridge req))
           (GET "/config" [] (json/wrap-json-response config))
           (POST "/save" [] (json/wrap-json-response save-handler))
           (route/resources "/"))


(defn run-gorilla-server
  [conf]
  (println "Gorilla-REPL.")
  ;; if a worksheet was specified in the options ...
  (when-let [ws (:worksheet conf)]
    ;; ... we store its filename in the config. We don't load it until the config information is requested.
    (swap! config-info #(assoc % :worksheet-filename ws)))
  ;; start the app
  (let [p (:port @config-info)
        s (jetty/run-jetty app-routes {:port p :join? false})]
    (println (str "Running at http://localhost:" p "/worksheet.html ."))
    (println "Ctrl+C to exit.")
    ;; block this thread by joining the server (which should run until killed)
    (.join s)))

(def cli-options
  [["-w" "--worksheet WORKSHEET" "Worksheet name"]])

(defn -main
  [& args]
  (run-gorilla-server (:options (parse-opts args cli-options)) #_{:worksheet "example.clj"}))