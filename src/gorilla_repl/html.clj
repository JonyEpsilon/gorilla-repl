;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(ns gorilla-repl.html
  (:require [gorilla-repl.renderer :as renderer]))

(defrecord Html [content])

(defn html [content]
  (Html. content))

(extend-type Html
  renderer/Renderable
  (render [self]
    {:type :html :content (:content self) :value (pr-str self)}))
