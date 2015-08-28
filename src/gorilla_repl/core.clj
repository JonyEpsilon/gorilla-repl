;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(ns gorilla-repl.core
  (:use compojure.core)
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            [org.httpkit.server :as server]
            [ring.middleware.keyword-params :as keyword-params]
            [ring.middleware.params :as params]
            [ring.middleware.json :as json]
            [ring.util.response :as res]
            [gorilla-repl.nrepl :as nrepl]
            [gorilla-repl.websocket-relay :as ws-relay]
            [gorilla-repl.renderer :as renderer] ;; this is needed to bring the render implementations into scope
            [gorilla-repl.files :as files]
            [gorilla-repl.version :as version]
            [clojure.set :as set]
            [clojure.java.io :as io])
  (:gen-class))


;; a wrapper for JSON API calls
(defn wrap-api-handler
  [handler]
  (-> handler
      (keyword-params/wrap-keyword-params)
      (params/wrap-params)
      (json/wrap-json-response)))

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


;; More ugly atom usage to support defroutes
(def excludes (atom #{".git"}))
;; API endpoint for getting the list of worksheets in the project
(defn gorilla-files [req]
  (let [excludes @excludes]
  (res/response {:files (files/gorilla-filepaths-in-current-directory excludes)})))

;; configuration information that will be made available to the webapp
(def conf (atom {}))
(defn set-config [k v] (swap! conf assoc k v))
;; API endpoint for getting webapp configuration information
(defn config [req] (res/response @conf))


;; the combined routes - we serve up everything in the "public" directory of resources under "/".
;; The REPL traffic is handled in the websocket-transport ns.
(defroutes app-routes
           (GET "/load" [] (wrap-api-handler load-worksheet))
           (POST "/save" [] (wrap-api-handler save))
           (GET "/gorilla-files" [] (wrap-api-handler gorilla-files))
           (GET "/config" [] (wrap-api-handler config))
           (GET "/repl" [] ws-relay/ring-handler)
           (route/resources "/")
           (route/files "/project-files" [:root "."]))


(defn run-gorilla-server
  [conf]
  ;; get configuration information from parameters
  (let [version (or (:version conf) "develop")
        webapp-requested-port (or (:port conf) 0)
        ip (or (:ip conf) "127.0.0.1")
        nrepl-requested-port (or (:nrepl-port conf) 0)  ;; auto-select port if none requested
        project (or (:project conf) "no project")
        keymap (or (:keymap (:gorilla-options conf)) {})
        _ (swap! excludes (fn [x] (set/union x (:load-scan-exclude (:gorilla-options conf)))))]
    ;; app startup
    (println "Gorilla-REPL:" version)
    ;; build config information for client
    (set-config :project project)
    (set-config :keymap keymap)
    ;; check for updates
    (version/check-for-update version)  ;; runs asynchronously
    ;; first startup nREPL
    (nrepl/start-and-connect nrepl-requested-port)
    ;; and then the webserver
    (let [s (server/run-server #'app-routes {:port webapp-requested-port :join? false :ip ip :max-body 500000000})
          webapp-port (:local-port (meta s))]
      (spit (doto (io/file ".gorilla-port") .deleteOnExit) webapp-port)
      (println (str "Running at http://" ip ":" webapp-port "/worksheet.html ."))
      (println "Ctrl+C to exit."))))

(defn -main
  [& args]
  (run-gorilla-server {:port 8990}))
