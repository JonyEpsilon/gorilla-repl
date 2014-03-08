;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(ns gorilla-repl.renderer)

;; This is the protocol that a type must implement if it wants to customise its rendering in Gorilla. It defines a
;; single function, render, that should transform the value into a value that the front-end's renderer can display.
;; TODO: move this out to its own project?
(defprotocol Renderable
  (render [self]))


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
    {:type :html :content "<span>nil</span>" :value "nil"}))

(extend-type clojure.lang.PersistentVector
  Renderable
  (render [self]
    {:type :list-like
     :open "["
     :close "]"
     :separator " "
     :items (map render self)
     :value (with-out-str (pr self))}))