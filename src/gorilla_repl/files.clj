(ns gorilla-repl.files
  "Utility functions to help with scanning for and loading gorilla files."
  (:require [clojure.string :as str]))

(defn ends-with
  [string ending]
  (if (< (count string) (count ending))
    false
    (let [l (count string)
          le (count ending)]
      (= (subs string (- l le) l) ending))))

(defn clj-file?
  [file]
  (ends-with (.getName file) ".clj"))

(defn cljw-file?
  [file]
  (ends-with (.getName file) ".cljw"))

(defn gorilla-file?
  [file]
  (when (.isFile file)
    (with-open [r (java.io.BufferedReader. (java.io.FileReader. file))]
      (let [first-line (.readLine r)]
        (if (> (count first-line) 26)
          (let [header (subs first-line 0 26)]
            (= header ";; gorilla-repl.fileformat")))))))

(defn excluded-file-seq
  [file excludes]
  (tree-seq
    (fn [f] (and (.isDirectory f) (not (contains? excludes (.getName f)))))
    (fn [f] (.listFiles f))
    file))

(defn include-file?
  "Should a file be included in the 'load file' list? Currently all .cljw files, and .clj files with a Gorilla header
  are included."
  [file]
  (or (cljw-file? file) (and (clj-file? file) (gorilla-file? file))))

(defn gorilla-filepaths-in-current-directory
  [excludes]
  (map #(str/replace-first (. % getPath) "./" "")
       (filter include-file? (excluded-file-seq
                               (clojure.java.io/file ".")
                               excludes))))