(ns gorilla-repl.worksheet-reader
  (:require [cheshire.core :refer :all]
            [clojure.java.io :as io]
            [clojure.string :as string]
            [markdown.core :refer :all]
            [instaparse.core :as insta]
            [hiccup.core :refer :all])
  (:import [org.apache.commons.lang StringEscapeUtils]))

(defn uncomment
  [xs]
  (string/join
   #"\n"
   (map
    (fn [x]
      (subs x 4))
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

    noDelimChar = !delimiter #'.|\\s'"))

(defn remove-open-close-tags
  [segment open-tag close-tag]
  (filter
   #(and
     (not= (first %) open-tag)
     (not= (first %) close-tag))
   segment))

(defn format-code
  [code]
  (str "<pre>" code "</pre>"))

(defn render-free-segment
  [a-free-segment]
  (html [:div {:class "segment free"}
         (md-to-html-string
          (StringEscapeUtils/unescapeJava a-free-segment))]))

(defn render-clojure-code
  [a-code-segment]
  (html [:div {:class "segment-main"}
         [:pre
          [:code.clojure a-code-segment]]]))

(defn render-worksheet
  [segments]
  (html [:html
         [:head
          [:link {:rel "stylesheet"
                  :href "http://fonts.googleapis.com/css?family=Arvo:400,700,400italic,700italic|Lora:400,700,400italic,700italic"
                  :type "text/css"}]
          [:link {:rel "stylesheet"
                  :href "http://yandex.st/highlightjs/8.0/styles/default.min.css"
                  :type "text/css"}]
          [:script {:src "http://yandex.st/highlightjs/8.0/highlight.min.js"}]
          [:script {:src "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"}]
          [:script {:type "text/javascript"}
           (slurp
            (io/resource "public/jslib/underscore/underscore.min.js"))]
          [:script {:type "text/javascript"}
           (slurp
            (io/resource "public/jslib/d3/d3.v3.min.js"))]
          [:script {:type "text/javascript"}
           (slurp
            (io/resource "public/jslib/d3/d3.geo.projection.min.js"))]
          [:script {:type "text/javascript"}
           (slurp
            (io/resource "public/jslib/vega/vega.1.3.3.min.js"))]
          [:script {:type "text/javascript"}
           (slurp
            (io/resource "public/jslib/uuid/uuid.core.js"))]
          [:script {:type "text/javascript"}
           (slurp
            (io/resource "public/jslib/mousetrap/mousetrap.min.js"))]
          
          [:script {:type "text/javascript"}
           (slurp
            (io/resource "public/jslib/jsedn/jsedn.js"))]
          [:script {:type "text/javascript"}
           (slurp
            (io/resource "public/jslib/vex/vex.combined.min.js"))]
          [:script {:type "text/javascript"}
           (slurp
            (io/resource "public/js/renderer.js"))]
          [:style (slurp
                   (io/resource "public/css/worksheet.css"))]]
         [:body
          [:div#contents segments]]]))

(defn read-worksheet
  [worksheet]
  (->> (gorilla-worksheet (slurp worksheet))
       (insta/transform
        {:worksheet (fn [& xs] (render-worksheet (rest xs)))
         
         :segmentWithBlankLine (fn [& xs] (first xs))
         
         :segment (fn [& xs]
                    (first xs))
         
         :freeSegment (fn [& xs]
                        (render-free-segment
                         (uncomment
                          (first
                           (remove-open-close-tags xs
                                                   :freeSegmentOpenTag
                                                   :freeSegmentCloseTag)))))
         
         :codeSegment (fn [& xs]
                        (let [code-segment
                              (remove-open-close-tags xs
                                                      :codeSegmentOpenTag
                                                      :codeSegmentCloseTag)]
                          (html
                           [:div {:class "segment code"}
                            (if-not (empty? code-segment)
                              (cons
                               (render-clojure-code
                                (first code-segment))
                               (rest code-segment))
                              code-segment)])))
         
         :consoleSection (fn [& xs]
                           (html
                            [:div.console-text
                             (uncomment
                              (first
                               (remove-open-close-tags xs
                                                       :consoleOpenTag
                                                       :consoleCloseTag)))]))
         
         :outputSection (fn [& xs]
                          (html
                           [:div.output
                            [:div]
                            [:script
                             {:type "text/javascript"}
                             "
var eles = document.getElementsByTagName('script');
ele = eles[eles.length - 1].parentNode.firstChild;"
                             (str
                              "render(JSON.parse("
                              (encode
                               (uncomment
                                (first
                                 (remove-open-close-tags xs
                                                         :outputOpenTag
                                                         :outputCloseTag))))
                              "), ele)")]]))
         
         :stringNoDelim (fn [& xs]
                          (apply str (map second xs)))})))


