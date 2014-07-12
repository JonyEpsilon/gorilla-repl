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
            [clojure.tools.nrepl.server :as nrepl-server]
            [clojure.java.io :as io]
            [gorilla-repl.websocket-relay :as ws-relay]
            [gorilla-repl.render-values-mw :as render-mw]
            [gorilla-repl.renderer :as renderer] ;; this is needed to bring the render implementations into scope
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
;; The REPL traffic is handled in the websocket-transport ns.
(defroutes app-routes
           (GET "/load" [] (wrap-api-handler load-worksheet))
           (POST "/save" [] (wrap-api-handler save))
           (GET "/completions" [] (wrap-api-handler completions))
           (GET "/repl" [] ws-relay/ring-handler)
           (route/resources "/"))


(defn run-gorilla-server
  [conf]
  (println "Gorilla-REPL.")
  ;; start the app - first start the nREPL server, and then the http server.
  (let [nrepl-requested-port (or (:nrepl-port conf) 0) ;; auto-select port if none requested
        nrepl (nrepl-server/start-server :port nrepl-requested-port
                                         :handler (nrepl-server/default-handler #'render-mw/render-values))
        nrepl-port (:port nrepl)
        repl-port-file (io/file ".nrepl-port")
        _ (println "Started nREPL server on port" nrepl-port)
        _ (ws-relay/connect-to-nrepl nrepl-port)
        webapp-port (or (:port conf) 8990)
        s (server/run-server app-routes {:port webapp-port :join? false})
        plugin? (:plugin? conf)]
    (spit (doto repl-port-file .deleteOnExit) nrepl-port)
    (println (str "Running at http://localhost:" webapp-port "/worksheet.html ."))
    (println "Ctrl+C to exit.")
    ;; block this thread by joining the server (which should run until killed)
    (when plugin?
      (.join s))))

(defn -main
  [& args]
  (run-gorilla-server {}))