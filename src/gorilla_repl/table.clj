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
          body (renderer/list-like (conj rows heading) "<table>" "</table>" "\n")]
      body)))
