;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(ns gorilla-repl.table
  (:require [gorilla-repl.renderer :as renderer]))

(defrecord Table [contents column-names])

(defn table [contents column-names]
  (Table. contents column-names))

(defn- list-like
  [data open close separator]
  {:type :list-like
   :open open
   :close close
   :separator separator
   :items data
   :value (pr-str data)})

(extend-type Table
  renderer/Renderable
  (render [self]
    (let [contents (:contents self)
          cols (:column-names self)
          heading (list-like (map renderer/render cols) "<tr><th>" "</th></tr>" "</th><th>")
          rows (map (fn [r] (list-like (map renderer/render r) "<tr><td>" "</td></tr>" "</td><td>")) contents)
          body (list-like (conj rows heading) "<center><table>" "</table></center>" "\n")]
      body)))
