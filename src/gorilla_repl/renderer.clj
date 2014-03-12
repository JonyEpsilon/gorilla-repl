;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(ns gorilla-repl.renderer
  (:require [clojure.string :as string]))

;;; This is the protocol that a type must implement if it wants to customise its rendering in Gorilla. It defines a
;;; single function, render, that should transform the value into a value that the front-end's renderer can display.
;; TODO: move this out to its own project?
(defprotocol Renderable
  (render [self]))

;;; Helper functions

;; Make a string safe to display as HTML
(defn- escape-html
  [str]
  ;; this list of HTML replacements taken from underscore.js
  ;; https://github.com/jashkenas/underscore
  (string/escape str {\& "&amp;", \< "&lt;", \> "&gt;", \" "&quot;", \' "&#x27;"}))

;; A lot of things render to an HTML span, with a class to mark the type of thing. This helper constructs the rendered
;; value in that case.
(defn- span-render
  [thing class]
  {:type :html
   :content (str "<span class='" class "'>" (escape-html (pr-str thing)) "</span>")
   :value (pr-str thing)})


;;; ** Renderers for basic Clojure forms **

;; A default, catch-all renderer that takes anything we don't know what to do with and calls str on it.
(extend-type Object
  Renderable
  (render [self]
    (span-render self "clj-unkown")))

;; nil values are a distinct thing of their own
(extend-type nil
  Renderable
  (render [self]
    (span-render self "clj-nil")))

(extend-type clojure.lang.Symbol
  Renderable
  (render [self]
    (span-render self "clj-symbol")))

(extend-type clojure.lang.Keyword
  Renderable
  (render [self]
    (span-render self "clj-keyword")))

(extend-type clojure.lang.Var
  Renderable
  (render [self]
    (span-render self "clj-var")))

(extend-type clojure.lang.Atom
  Renderable
  (render [self]
    (span-render self "clj-atom")))

(extend-type clojure.lang.Agent
  Renderable
  (render [self]
    (span-render self "clj-agent")))

(extend-type clojure.lang.Ref
  Renderable
  (render [self]
    (span-render self "clj-ref")))

(extend-type java.lang.String
  Renderable
  (render [self]
    (span-render self "clj-string")))

(extend-type java.lang.Long
  Renderable
  (render [self]
    (span-render self "clj-long")))

(extend-type java.lang.Double
  Renderable
  (render [self]
    (span-render self "clj-double")))

(extend-type clojure.lang.BigInt
  Renderable
  (render [self]
    (span-render self "clj-bigint")))

(extend-type java.math.BigDecimal
  Renderable
  (render [self]
    (span-render self "clj-bigdecimal")))


(extend-type clojure.lang.PersistentVector
  Renderable
  (render [self]
    {:type :list-like
     :open "<span class='clj-vector'>[<span>"
     :close "<span class='clj-vector'>]</span>"
     :separator " "
     :items (map render self)
     :value (pr-str self)}))

(extend-type clojure.lang.LazySeq
  Renderable
  (render [self]
    {:type :list-like
     :open "<span class='clj-lazy-seq'>(<span>"
     :close "<span class='clj-lazy-seq'>)</span>"
     :separator " "
     :items (map render self)
     :value (pr-str self)}))

(extend-type clojure.lang.PersistentList
  Renderable
  (render [self]
    {:type :list-like
     :open "<span class='clj-list'>(<span>"
     :close "<span class='clj-list'>)</span>"
     :separator " "
     :items (map render self)
     :value (pr-str self)}))
