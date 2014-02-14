(ns gorilla-repl.table
  (:require [hiccup.core :as hiccup]))


(defn- table-row
  [r]
  [:tr (map (fn [i] [:td i]) r)])

(defn- table-body
  [d]
  [:table {:class "output-table"} (map table-row d)])

(defn- table-html
  [d]
  (hiccup/html (table-body d)))

(defn table-form
  [d]
  {:gorilla-repl.types/html (table-html d)})