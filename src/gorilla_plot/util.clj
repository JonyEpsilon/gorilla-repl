;;;; This file is part of gorilla-repl. Copyright (C) 2014-, Jony Hudson.
;;;;
;;;; gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.

(ns gorilla-plot.util)

(defn count-in-range
  [data min max]
  (count (filter #(and (< % max) (>= % min)) data)))

(defn bin-counts
  [data min max bin-width]
  (let [bin-starts (range min max bin-width)]
    (map #(count-in-range data % (+ % bin-width)) bin-starts)))
