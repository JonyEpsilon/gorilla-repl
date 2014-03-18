;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(ns gorilla-repl.latex
  (:require [gorilla-renderable.core :as render]))

(defrecord LatexView [content])

(defn latex-view [content] (LatexView. content))

(extend-type LatexView
  render/Renderable
  (render [self]
    {:type :latex :content (:content self) :value (pr-str self)}))
