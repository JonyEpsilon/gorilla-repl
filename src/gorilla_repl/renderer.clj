;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(ns gorilla-repl.renderer
  (:require [clojure.string :as string]
            [gorilla-renderable.core :as r]))


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
  r/Renderable
  (render [self]
    (span-render self "clj-unkown")))

;; nil values are a distinct thing of their own
(extend-type nil
  r/Renderable
  (render [self]
    (span-render self "clj-nil")))

(extend-type clojure.lang.Symbol
  r/Renderable
  (render [self]
    (span-render self "clj-symbol")))

(extend-type clojure.lang.Keyword
  r/Renderable
  (render [self]
    (span-render self "clj-keyword")))

(extend-type clojure.lang.Var
  r/Renderable
  (render [self]
    (span-render self "clj-var")))

(extend-type clojure.lang.Atom
  r/Renderable
  (render [self]
    (span-render self "clj-atom")))

(extend-type clojure.lang.Agent
  r/Renderable
  (render [self]
    (span-render self "clj-agent")))

(extend-type clojure.lang.Ref
  r/Renderable
  (render [self]
    (span-render self "clj-ref")))

(extend-type java.lang.String
  r/Renderable
  (render [self]
    (span-render self "clj-string")))

(extend-type java.lang.Character
  r/Renderable
  (render [self]
    (span-render self "clj-char")))

(extend-type java.lang.Long
  r/Renderable
  (render [self]
    (span-render self "clj-long")))

(extend-type java.lang.Double
  r/Renderable
  (render [self]
    (span-render self "clj-double")))

(extend-type clojure.lang.BigInt
  r/Renderable
  (render [self]
    (span-render self "clj-bigint")))

(extend-type java.math.BigDecimal
  r/Renderable
  (render [self]
    (span-render self "clj-bigdecimal")))

(extend-type clojure.lang.Ratio
  r/Renderable
  (render [self]
    (span-render self "clj-ratio")))

(extend-type java.lang.Class
  r/Renderable
  (render [self]
    (span-render self "clj-class")))

(extend-type clojure.lang.IPersistentVector
  r/Renderable
  (render [self]
    {:type :list-like
     :open "<span class='clj-vector'>[</span>"
     :close "<span class='clj-vector'>]</span>"
     :separator " "
     :items (map r/render self)
     :value (pr-str self)}))

(extend-type clojure.lang.LazySeq
  r/Renderable
  (render [self]
    {:type :list-like
     :open "<span class='clj-lazy-seq'>(</span>"
     :close "<span class='clj-lazy-seq'>)</span>"
     :separator " "
     :items (map r/render self)
     :value (pr-str self)}))

(extend-type clojure.lang.IPersistentList
  r/Renderable
  (render [self]
    {:type :list-like
     :open "<span class='clj-list'>(</span>"
     :close "<span class='clj-list'>)</span>"
     :separator " "
     :items (map r/render self)
     :value (pr-str self)}))

;; TODO: is this really necessary? Is there some interface I'm missing for lists? Or would just ISeq work?
(extend-type clojure.lang.ArraySeq
  r/Renderable
  (render [self]
    {:type :list-like
     :open "<span class='clj-list'>(</span>"
     :close "<span class='clj-list'>)</span>"
     :separator " "
     :items (map r/render self)
     :value (pr-str self)}))

(extend-type clojure.lang.Cons
  r/Renderable
  (render [self]
    {:type :list-like
     :open "<span class='clj-list'>(</span>"
     :close "<span class='clj-list'>)</span>"
     :separator " "
     :items (map r/render self)
     :value (pr-str self)}))


;; When we render a map we will map over its entries, which will yield key-value pairs represented as vectors. To render
;; the map we render each of these key-value pairs with this helper function. They are rendered as list-likes with no
;; bracketing. These will then be assembled in to a list-like for the whole map by the IPersistentMap render function.
(defn- render-map-entry
  [entry]
  {:type :list-like
   :open ""
   :close ""
   :separator " "
   :items (map r/render entry)
   :value (pr-str entry)})

(extend-type clojure.lang.IPersistentMap
  r/Renderable
  (render [self]
    {:type :list-like
     :open "<span class='clj-map'>{</span>"
     :close "<span class='clj-map'>}</span>"
     :separator ", "
     :items (map render-map-entry self)
     :value (pr-str self)}))


(extend-type clojure.lang.IPersistentSet
  r/Renderable
  (render [self]
    {:type :list-like
     :open "<span class='clj-set'>#{</span>"
     :close "<span class='clj-set'>}</span>"
     :separator " "
     :items (map r/render self)
     :value (pr-str self)}))

;; A record is like a map, but it is tagged with its type
(extend-type clojure.lang.IRecord
  r/Renderable
  (render [self]
    {:type :list-like
     :open (str "<span class='clj-record'>#" (pr-str (type self)) "{</span>")
     :close "<span class='clj-record'>}</span>"
     :separator " "
     :items (map render-map-entry self)
     :value (pr-str self)}))