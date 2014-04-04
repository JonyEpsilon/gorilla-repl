(ns gorilla-repl.worksheet-reader
  (:require [clojure.string :as string]
            [instaparse.core :as insta]))

(defn uncomment
  [xs]
  (string/join
   #"\n"
   (map
    (fn [x]
      (subs x 3))
    (string/split-lines xs))))

(def gorilla-worksheet
  (insta/parser
   "worksheet = worksheetHeader segmentWithBlankLine*

    lineEnd = '\\n' / '\\r\\n'

    worksheetHeader = ';; gorilla-repl.fileformat = 1' lineEnd lineEnd

    segmentWithBlankLine = segment lineEnd?

    segment = freeSegment / codeSegment

    freeSegment = freeSegmentOpenTag stringNoDelim? freeSegmentCloseTag

    freeSegmentOpenTag = ';; **' lineEnd

    freeSegmentCloseTag = lineEnd ';; **' lineEnd

    codeSegment = codeSegmentOpenTag stringNoDelim? codeSegmentCloseTag consoleSection? outputSection?

    codeSegmentOpenTag = ';; @@' lineEnd

    codeSegmentCloseTag = lineEnd ';; @@' lineEnd

    outputSection = outputOpenTag stringNoDelim outputCloseTag

    outputOpenTag = ';; =>' lineEnd

    outputCloseTag = lineEnd ';; <=' lineEnd

    consoleSection = consoleOpenTag stringNoDelim consoleCloseTag

    consoleOpenTag = ';; ->' lineEnd

    consoleCloseTag = lineEnd ';; <-' lineEnd

    stringNoDelim = noDelimChar+

    delimiter = freeSegmentOpenTag / freeSegmentCloseTag / codeSegmentOpenTag / codeSegmentCloseTag / outputOpenTag / outputCloseTag / consoleOpenTag / consoleCloseTag

    noDelimChar = !delimiter #'.|\\s+'"))

(defn read-worksheet
  [worksheet]
  (->> (gorilla-worksheet (slurp worksheet))
       (insta/transform
        {:worksheet (fn [& xs] (rest xs))
         :segmentWithBlankLine (fn [& xs] (first xs))
         :freeSegment (fn [& xs] [:freeSegment
                                 (uncomment
                                  (first
                                   (filter
                                    #(and (not= (first %)
                                                :freeSegmentOpenTag)
                                          (not= (first %)
                                                :freeSegmentCloseTag))
                                    xs)))])
         :codeSegment (fn [& xs] [:codeSegment
                                 (filter
                                  #(and (not= (first %)
                                              :codeSegmentOpenTag)
                                        (not= (first %)
                                              :codeSegmentCloseTag))
                                  xs)])
         :consoleSection (fn [& xs] [:consoleSection
                                    (uncomment
                                     (first
                                      (filter
                                       #(and (not= (first %)
                                                   :consoleOpenTag)
                                             (not= (first %)
                                                   :consoleCloseTag))
                                       xs)))])
         :outputSection (fn [& xs] [:outputSection
                                   (uncomment
                                    (first
                                     (filter
                                      #(and (not= (first %)
                                                  :outputOpenTag)
                                            (not= (first %)
                                                  :outputCloseTag))
                                      xs)))])
         :stringNoDelim (fn [& xs] (apply str (map second xs)))})))
