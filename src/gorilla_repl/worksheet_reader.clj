(ns gorilla-repl.worksheet-reader
  (:require [cheshire.core :refer :all]
            [clojure.java.io :as io]
            [clojure.string :as string]
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
         (str
          "<script>
var scriptTag = document.getElementsByTagName('script');
scriptTag = scriptTag[scriptTag.length - 1];
var parentTag = scriptTag.parentNode;
parentTag.innerHTML = converter.makeHtml(\""
          a-free-segment
          \"");</script>")]))

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
          [:script {:type "text/javascript"
                    :src "http://yandex.st/highlightjs/8.0/highlight.min.js"}]
          [:script {:type "text/javascript"}
           (slurp
            (io/resource "public/jslib/jquery/jquery-1.10.2.min.js"))]
          [:script {:type "text/javascript"}
           (slurp
            (io/resource "public/jslib/underscore/underscore.min.js"))]
          [:script {:type "text/javascript"
                    :src  "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG-full.js&amp;delayStartupUntil=configured"}]
          [:script {:type "text/javascript"}

           "MathJax.Hub.Config({
             messageStyle: \"none\",
             showProcessingMessages: false,
             skipStartupTypeset: true,
             tex2jax: {
              inlineMath: [
               ['@@', '@@']
              ]
             }
            });
            MathJax.Hub.Configured();"]
          [:script {:type "text/javascript"}
           (slurp
            (io/resource "public/jslib/markdown/Markdown.Converter.js"))]
          [:script {:type "text/javascript"}
           (slurp
            (io/resource "public/jslib/markdown/Markdown.Sanitizer.js"))]
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
          [:script {:type "text/javascript"}
           "var converter = new Markdown.Converter();"]
          [:style (slurp
                   (io/resource "public/css/worksheet.css"))]]
         [:body
          [:div#contents segments]
          [:script "MathJax.Hub.Queue([\"Typeset\",MathJax.Hub]);"]]]))

(defn worksheet-str->standalone-html
  [worksheet]
  (->> (gorilla-worksheet worksheet)
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

(defn worksheet->standalone-html
  [filename]
  (worksheet-str->standalone-html
   (slurp filename)))


