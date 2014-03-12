;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(ns gorilla-repl.vega
  (:require [gorilla-repl.renderer :as renderer]))

(defrecord Vega [content])

(defn vega [content] (Vega. content))

(extend-type Vega
  renderer/Renderable
  (render [self]
    {:type :vega :content (:content self) :value (pr-str self)}))