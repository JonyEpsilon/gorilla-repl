;;;; Functions for constructing vega specs. Many of the defaults are adapted from the vega examples.

(ns gorilla-repl.vega)

(defn container
  []
  {"width"   400
   "height"  247
   "padding" {"top" 10, "left" 30, "bottom" 20, "right" 10}})

(defn data-from-list
  [data-key xs ys]
  {"data" [{"name"   data-key,
            "values" (map (fn [x y] {"x" x "y" y}) xs ys)}]
   })

(defn default-plot-axes
  []
  {"axes" [{"type" "x" "scale" "x"}
           {"type" "y" "scale" "y"}]})

;;; Scatter plots

(defn default-list-plot-scales
  [data-key]
  {"scales" [{"name"   "x",
              "type"   "linear",
              "range"  "width",
              "zero"   false,
              "domain" {"data" data-key, "field" "data.x"}
              },
             {"name"   "y",
              "type"   "linear",
              "range"  "height",
              "nice"   true,
              "domain" {"data" data-key, "field" "data.y"}
              }
             ]})

(defn list-plot-marks
  [data-key]
  {"marks" [{"type"       "symbol",
             "from"       {"data" data-key},
             "properties" {"enter"  {"x"           {"scale" "x", "field" "data.x"},
                                     "y"           {"scale" "y", "field" "data.y"},
                                     "y2"          {"scale" "y", "value" 0},
                                     "fill"        {"value" "steelblue"},
                                     "fillOpacity" {"value" 0.5}
                                     },
                           "update" {"size"   {"value" 70},
                                     "stroke" {"value" "transparent"}
                                     },
                           "hover"  {"size"   {"value" 200},
                                     "stroke" {"value" "white"}
                                     }
                           }}]})

;;; Bar charts

(defn default-bar-chart-scales
  [data-key]
  {"scales" [{"name" "x", "type" "ordinal", "range" "width", "domain" {"data" data-key, "field" "data.x"}}
             {"name" "y", "range" "height", "nice" true, "domain" {"data" data-key, "field" "data.y"}}
             ]})

(defn bar-chart-marks
  [data-key]
  {"marks" [{"type"       "rect",
             "from"       {"data" data-key},
             "properties" {"enter"  {"x"     {"scale" "x", "field" "data.x"},
                                     "width" {"scale" "x", "band" true, "offset" -1},
                                     "y"     {"scale" "y", "field" "data.y"},
                                     "y2"    {"scale" "y", "value" 0}
                                     },
                           "update" {"fill" {"value" "steelblue"}},
                           "hover"  {"fill" {"value" "red"}}}}]})

