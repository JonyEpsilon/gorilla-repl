(ns gorilla-repl.plot
  (:require [gorilla-repl.vega :as vega]))

(defn list-plot
  [xs ys]
  (let [series-name "test"]
    (merge
      (vega/container)
      (vega/data-from-list series-name xs ys)
      (vega/list-plot-marks series-name)
      (vega/default-list-plot-scales series-name)
      (vega/default-plot-axes))))


(defn bar-chart
  [categories values]
  (let [series-name "test"]
    (merge
      (vega/container)
      (vega/data-from-list series-name categories values)
      (vega/bar-chart-marks series-name)
      (vega/default-bar-chart-scales series-name)
      (vega/default-plot-axes))))

(defn show
  [g]
  {:gorilla-vega g})