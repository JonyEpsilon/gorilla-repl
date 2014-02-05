;; gorilla-repl.fileformat = 1

;; **
;;; # Graphing tests
;;; 
;;; A showcase of gorilla-plot graph types.
;; **

;; @@
(use 'gorilla-plot.core)
(use 'clojure.pprint)
;; @@
;; =>
;;; nil
;; <=

;; @@
(def d
  [1 3 5 7 9 5 4 6 9 8 3 5 6])
;; @@
;; =>
;;; #'user/d
;; <=

;; @@
(show 
 (list-plot (range (count d)) d))
;; @@
;; =>
;;; {:gorilla-vega {"axes" [{"scale" "x", "type" "x"} {"scale" "y", "type" "y"}], "scales" [{"name" "x", "type" "linear", "range" "width", "domain" {"data" "test", "field" "data.x"}} {"name" "y", "type" "linear", "range" "height", "nice" true, "domain" {"data" "test", "field" "data.y"}}], "marks" [{"type" "symbol", "from" {"data" "test"}, "properties" {"update" {"size" {"value" 70}, "stroke" {"value" "transparent"}}, "enter" {"fill" {"value" "steelblue"}, "fillOpacity" {"value" 0.5}, "x" {"scale" "x", "field" "data.x"}, "y" {"scale" "y", "field" "data.y"}}, "hover" {"size" {"value" 200}, "stroke" {"value" "white"}}}}], "data" [{"name" "test", "values" ({"x" 0, "y" 1} {"x" 1, "y" 3} {"x" 2, "y" 5} {"x" 3, "y" 7} {"x" 4, "y" 9} {"x" 5, "y" 5} {"x" 6, "y" 4} {"x" 7, "y" 6} {"x" 8, "y" 9} {"x" 9, "y" 8} {"x" 10, "y" 3} {"x" 11, "y" 5} {"x" 12, "y" 6})}], "width" 400, "height" 247, "padding" {"left" 30, "bottom" 20, "top" 10, "right" 10}}}
;; <=

;; @@
(show 
 (bar-chart (range (count d)) d))
;; @@
;; =>
;;; {:gorilla-vega {"axes" [{"scale" "x", "type" "x"} {"scale" "y", "type" "y"}], "scales" [{"name" "x", "type" "ordinal", "range" "width", "domain" {"data" "test", "field" "data.x"}} {"name" "y", "range" "height", "nice" true, "domain" {"data" "test", "field" "data.y"}}], "marks" [{"type" "rect", "from" {"data" "test"}, "properties" {"update" {"fill" {"value" "steelblue"}}, "enter" {"width" {"scale" "x", "offset" -1, "band" true}, "x" {"scale" "x", "field" "data.x"}, "y" {"scale" "y", "field" "data.y"}, "y2" {"scale" "y", "value" 0}}, "hover" {"fill" {"value" "red"}}}}], "data" [{"name" "test", "values" ({"x" 0, "y" 1} {"x" 1, "y" 3} {"x" 2, "y" 5} {"x" 3, "y" 7} {"x" 4, "y" 9} {"x" 5, "y" 5} {"x" 6, "y" 4} {"x" 7, "y" 6} {"x" 8, "y" 9} {"x" 9, "y" 8} {"x" 10, "y" 3} {"x" 11, "y" 5} {"x" 12, "y" 6})}], "width" 400, "height" 247, "padding" {"left" 30, "bottom" 20, "top" 10, "right" 10}}}
;; <=

;; @@
(def p (list-plot (range (count d)) d))
;; @@
;; =>
;;; #'user/p
;; <=

;; @@
(pprint p)
;; @@
;; ->
;;; {"axes" [{"scale" "x", "type" "x"} {"scale" "y", "type" "y"}],
;;;  "scales"
;;;  [{"name" "x",
;;;    "type" "linear",
;;;    "range" "width",
;;;    "domain" {"data" "test", "field" "data.x"}}
;;;   {"name" "y",
;;;    "type" "linear",
;;;    "range" "height",
;;;    "nice" true,
;;;    "domain" {"data" "test", "field" "data.y"}}],
;;;  "marks"
;;;  [{"type" "symbol",
;;;    "from" {"data" "test"},
;;;    "properties"
;;;    {"update" {"size" {"value" 70}, "stroke" {"value" "transparent"}},
;;;     "enter"
;;;     {"fill" {"value" "steelblue"},
;;;      "fillOpacity" {"value" 0.5},
;;;      "x" {"scale" "x", "field" "data.x"},
;;;      "y" {"scale" "y", "field" "data.y"}},
;;;     "hover" {"size" {"value" 200}, "stroke" {"value" "white"}}}}],
;;;  "data"
;;;  [{"name" "test",
;;;    "values"
;;;    ({"x" 0, "y" 1}
;;;     {"x" 1, "y" 3}
;;;     {"x" 2, "y" 5}
;;;     {"x" 3, "y" 7}
;;;     {"x" 4, "y" 9}
;;;     {"x" 5, "y" 5}
;;;     {"x" 6, "y" 4}
;;;     {"x" 7, "y" 6}
;;;     {"x" 8, "y" 9}
;;;     {"x" 9, "y" 8}
;;;     {"x" 10, "y" 3}
;;;     {"x" 11, "y" 5}
;;;     {"x" 12, "y" 6})}],
;;;  "width" 400,
;;;  "height" 247,
;;;  "padding" {"left" 30, "bottom" 20, "top" 10, "right" 10}}
;;; 
;; <-
;; =>
;;; nil
;; <=

;; @@
(show (assoc-in p ["marks" 0 "properties" "enter" "fill" "value"] "red"))
;; @@
;; =>
;;; {:gorilla-vega {"axes" [{"scale" "x", "type" "x"} {"scale" "y", "type" "y"}], "scales" [{"name" "x", "type" "linear", "range" "width", "domain" {"data" "test", "field" "data.x"}} {"name" "y", "type" "linear", "range" "height", "nice" true, "domain" {"data" "test", "field" "data.y"}}], "marks" [{"type" "symbol", "from" {"data" "test"}, "properties" {"update" {"size" {"value" 70}, "stroke" {"value" "transparent"}}, "enter" {"fill" {"value" "red"}, "fillOpacity" {"value" 0.5}, "x" {"scale" "x", "field" "data.x"}, "y" {"scale" "y", "field" "data.y"}}, "hover" {"size" {"value" 200}, "stroke" {"value" "white"}}}}], "data" [{"name" "test", "values" ({"x" 0, "y" 1} {"x" 1, "y" 3} {"x" 2, "y" 5} {"x" 3, "y" 7} {"x" 4, "y" 9} {"x" 5, "y" 5} {"x" 6, "y" 4} {"x" 7, "y" 6} {"x" 8, "y" 9} {"x" 9, "y" 8} {"x" 10, "y" 3} {"x" 11, "y" 5} {"x" 12, "y" 6})}], "width" 400, "height" 247, "padding" {"left" 30, "bottom" 20, "top" 10, "right" 10}}}
;; <=

;; @@

;; @@
