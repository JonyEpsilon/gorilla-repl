;; gorilla-repl.fileformat = 1

;; **
;;; # Experiments with a new renderer
;;; 
;;; I want to improve the render. In particular I would like to have it be able to render nested structures (like a table of graphs, or latex formulae) and I would like it to be extensible without changing Gorilla's code (I don't want to curate a library of renderers for everything in the universe).
;;; 
;;; The basic idea is to have a Renderable protocol on the Clojure side:
;; **

;; @@
(defprotocol Renderable
  (render [self]))
;; @@
;; =>
;;; Renderable
;; <=

;; **
;;; By default, things will just render by generating a string.
;; **

;; @@
(extend-type Object
  Renderable
  (render [self]
          {:type :raw :content (str self)}))
;; @@
;; =>
;;; nil
;; <=

;; **
;;; We can think of something like a table, that is implemented as a Clojure record type:
;; **

;; @@
(defrecord Table [contents])
;; @@
;; =>
;;; user.Table
;; <=

;; **
;;; This could render itself, and include its rendered contents.
;; **

;; @@
(extend-type Table
  Renderable
  (render [self]
          {:type :html-template :markup "Table placeholder" :children (map #(map render %) (:contents self))}))
;; @@
;; =>
;;; nil
;; <=

;; @@
(def t (Table. [[1 :a] [2 :b] [3 :c] [4 :d]]))
;; @@
;; =>
;;; #'user/t
;; <=

;; @@
(render t)
;; @@
;; =>
;;; {:type :html-template, :markup "Table placeholder", :children (({:type :raw, :content "1"} {:type :raw, :content ":a"}) ({:type :raw, :content "2"} {:type :raw, :content ":b"}) ({:type :raw, :content "3"} {:type :raw, :content ":c"}) ({:type :raw, :content "4"} {:type :raw, :content ":d"}))}
;; <=

;; @@
(render [t t])
;; @@
;; =>
;;; {:type :html-template, :markup "[{{#each children}}]", :children ({:type :html-template, :markup "Table placeholder", :children (({:type :raw, :content "1"} {:type :raw, :content ":a"}) ({:type :raw, :content "2"} {:type :raw, :content ":b"}) ({:type :raw, :content "3"} {:type :raw, :content ":c"}) ({:type :raw, :content "4"} {:type :raw, :content ":d"}))} {:type :html-template, :markup "Table placeholder", :children (({:type :raw, :content "1"} {:type :raw, :content ":a"}) ({:type :raw, :content "2"} {:type :raw, :content ":b"}) ({:type :raw, :content "3"} {:type :raw, :content ":c"}) ({:type :raw, :content "4"} {:type :raw, :content ":d"}))})}
;; <=

;; @@
(extend-type clojure.lang.PersistentVector
  Renderable
  (render [self]
          {:type :html-template :markup "[{{#each children}}]" :children (map render self)}))
;; @@
;; =>
;;; nil
;; <=

;; @@
(type {1 2 3 4})
;; @@
;; =>
;;; clojure.lang.PersistentArrayMap
;; <=

;; @@
(use '[cheshire.core :as json])
;; @@
;; =>
;;; nil
;; <=

;; @@
(json/generate-string (render [1 2 3]))
;; @@
;; =>
;;; "{\"type\":\"html-template\",\"markup\":\"[{{#each children}}]\",\"children\":[{\"type\":\"raw\",\"content\":\"1\"},{\"type\":\"raw\",\"content\":\"2\"},{\"type\":\"raw\",\"content\":\"3\"}]}"
;; <=

;; @@
(render (Table. [[1 2] [3 (Table. [[1 2] [3 4]])]]))
;; @@
;; =>
;;; {:type :html-template, :markup "Table placeholder", :children (({:type :raw, :content "1"} {:type :raw, :content "2"}) ({:type :raw, :content "3"} {:type :html-template, :markup "Table placeholder", :children (({:type :raw, :content "1"} {:type :raw, :content "2"}) ({:type :raw, :content "3"} {:type :raw, :content "4"}))}))}
;; <=

;; @@
(java.util.Date.)
;; @@
;; =>
;;; #inst "2014-03-06T18:53:21.554-00:00"
;; <=

;; @@
(type #inst "2014-03-06T18:53:21.554-00:00")
;; @@
;; =>
;;; java.util.Date
;; <=

;; @@

;; @@
