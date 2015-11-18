;;;; This file is part of gorilla-repl. Copyright (C) 2015-, Gorilla REPL contributors.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(ns gorilla-repl.handle
  "Ring handlers for Gorilla server functions. Broken out into their own namespace so as to be usable without having to
  use Gorilla's embedded HTTPKit server. Note that as well as the handlers there are two functions in this NS,
  `update-excludes` and `set-config` that modify the state returned by handlers."
  (:require [ring.middleware.keyword-params :as keyword-params]
            [ring.middleware.params :as params]
            [ring.middleware.json :as json]
            [ring.util.response :as res]
            [gorilla-repl.files :as files]))

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
(def ^:private excludes (atom #{".git"}))

;; configuration information that will be made available to the webapp
(def ^:private conf (atom {}))

;; API endpoint for getting webapp configuration information
(defn config [req] (res/response @conf))

;; API endpoint for getting the list of worksheets in the project
(defn gorilla-files [req]
  (let [excludes @excludes]
    (res/response {:files (files/gorilla-filepaths-in-current-directory excludes)})))

;; configuration information that will be made available to the webapp
(defn set-config [k v] (swap! conf assoc k v))

(defn update-excludes [fn]
  (swap! excludes fn))
