;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(ns gorilla-repl.table
  (:require [gorilla-repl.renderer :as renderer]))

(defrecord Table [contents column-names])

(defn table [contents column-names]
  (Table. contents column-names))

(extend-type Table
  renderer/Renderable
  (render [self]
    (let [contents (:contents self)
          cols (:column-names self)
          heading (renderer/list-like (map renderer/render cols) "<tr><th>" "</th></tr>" "</th><th>")
          rows (map (fn [r] (renderer/list-like (map renderer/render r) "<tr><td>" "</td></tr>" "</td><td>")) contents)
          body (renderer/list-like (conj rows heading) "<center><table>" "</table></center>" "\n")]
      body)))
