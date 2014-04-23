;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

;;; Functions for constructing vega specs. Many of the defaults are adapted from the vega examples.

(ns gorilla-plot.vega
  (:require [gorilla-repl.vega :as vega]))

(defn container
  [plot-size aspect-ratio]
  {:width   plot-size
   :height  (float (/ plot-size aspect-ratio))
   :padding {:top 10, :left 50, :bottom 20, :right 10}})

(defn data-from-list
  [data-key data]
  {:data [{:name   data-key,
           :values (map (fn [[x y]] {:x x :y y}) data)}]
   })

(defn default-plot-axes
  []
  {:axes [{:type "x" :scale "x"}
          {:type "y" :scale "y"}]})

;;; Scatter/list plots

(defn- domain-helper
  [data-key axis-plot-range axis]
  (if (= axis-plot-range :all) {:data data-key, :field (str "data." axis)} axis-plot-range))

(defn default-list-plot-scales
  [data-key plot-range]
  {:scales [{:name   "x"
             :type   "linear"
             :range  "width"
             :zero   false
             :domain (domain-helper data-key (first plot-range) "x")
             },
            {:name   "y"
             :type   "linear"
             :range  "height"
             :nice   true
             :zero   false
             :domain (domain-helper data-key (second plot-range) "y")
             }
            ]})

(defn list-plot-marks
  [data-key colour #_shape size opacity]
  {:marks [{:type        "symbol",
            :from       {:data data-key}
            :properties {:enter  {:x           {:scale "x", :field "data.x"}
                                  :y           {:scale "y", :field "data.y"}
                                  :fill        {:value (or colour "steelblue")}
                                  :fillOpacity {:value opacity}
                                  }
                         :update {:shape #_shape "circle"
                                  :size        {:value size}
                                  :stroke      {:value "transparent"}
                                  }
                         :hover  {:size   {:value (* 3 size)}
                                  :stroke {:value "white"}
                                  }}}]})

(defn line-plot-marks
  [data-key colour opacity]
  {:marks [{:type       "line",
            :from       {:data data-key}
            :properties {:enter {:x             {:scale "x", :field "data.x"}
                                 :y             {:scale "y", :field "data.y"}
                                 :stroke        {:value (or colour "#FF29D2")}
                                 :strokeWidth   {:value 2}
                                 :strokeOpacity {:value opacity}
                                 }}}]})


;;; Bar charts

(defn default-bar-chart-scales
  [data-key plot-range]
  {:scales [{:name   "x"
             :type   "ordinal"
             :range  "width"
             :domain (domain-helper data-key (first plot-range) "x")}
            {:name   "y"
             :range  "height"
             :nice   true
             :domain (domain-helper data-key (second plot-range) "y")}
            ]})

(defn bar-chart-marks
  [data-key colour opacity]
  {:marks [{:type       "rect"
            :from       {:data data-key}
            :properties {:enter {:x     {:scale "x", :field "data.x"}
                                 :width {:scale "x", :band true, :offset -1}
                                 :y     {:scale "y", :field "data.y"}
                                 :y2    {:scale "y", :value 0}}
                         :update {:fill    {:value (or colour "steelblue")}
                                  :opacity {:value opacity}}
                         :hover  {:fill {:value "#FF29D2"}}}}]})


;;; Histograms

(defn histogram-marks
  [data-key colour opacity fillOpacity]
  {:marks [{:type       "line",
            :from       {:data data-key}
            :properties {:enter {:x             {:scale "x", :field "data.x"}
                                 :y             {:scale "y", :field "data.y"}
                                 :interpolate   {:value "step-before"}
                                 :fill          {:value (or colour "steelblue")}
                                 :fillOpacity   {:value fillOpacity}
                                 :stroke        {:value (or colour "steelblue")}
                                 :strokeWidth   {:value 2}
                                 :strokeOpacity {:value opacity}
                                 }}}]})

(defn from-vega
  [g]
  (:content g))