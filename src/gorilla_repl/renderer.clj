;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(ns gorilla-repl.renderer)

;; This is the protocol that a type must implement if it wants to customise its rendering in Gorilla. It defines a
;; single function, render, that should transform the value into a value that the front-end's renderer can display.
;; TODO: move this out to its own project?
(defprotocol Renderable
  (render [self]))

;; Helper functions
(defn list-like
  [data open close separator]
  {:type :list-like
   :open open
   :close close
   :separator separator
   :items data
   :value (with-out-str (pr data))})

;; ** Renderers for basic Clojure forms **

;; A default, catch-all renderer that takes anything we don't know what to do with and calls str on it.
(extend-type Object
  Renderable
  (render [self]
    {:type :html :content (with-out-str (pr self)) :value (with-out-str (pr self))}))

;; nil values are a distinct thing of their own
(extend-type nil
  Renderable
  (render [self]
    {:type :html :content "<span class='clj-nil'>nil</span>" :value "nil"}))

(extend-type clojure.lang.Symbol
  Renderable
  (render [self]
    {:type :html
     :content (str "<span class='clj-symbol'>" (with-out-str (pr self)) "</span>")
     :value (with-out-str (pr self))}))

(extend-type java.lang.Long
  Renderable
  (render [self]
    {:type :html
     :content (str "<span class='clj-long'>" (with-out-str (pr self)) "</span>")
     :value (with-out-str (pr self))}))


(extend-type clojure.lang.PersistentVector
  Renderable
  (render [self]
    {:type :list-like
     :open "<span class='clj-vector'>[<span>"
     :close "<span class='clj-vector'>]</span>"
     :separator " "
     :items (map render self)
     :value (with-out-str (pr self))}))

(extend-type clojure.lang.LazySeq
  Renderable
  (render [self]
    {:type :list-like
     :open "<span class='clj-lazy-seq'>(<span>"
     :close "<span class='clj-lazy-seq'>)</span>"
     :separator " "
     :items (map render self)
     :value (with-out-str (pr self))}))

(extend-type clojure.lang.PersistentList
  Renderable
  (render [self]
    {:type :list-like
     :open "<span class='clj-list'>(<span>"
     :close "<span class='clj-list'>)</span>"
     :separator " "
     :items (map render self)
     :value (with-out-str (pr self))}))
