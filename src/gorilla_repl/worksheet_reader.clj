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
  (html [:pre
         [:code.clojure a-code-segment]]))

(defn render-worksheet
  [segments]
  (html [:html
         [:head
          [:link {:rel "stylesheet"
                  :href "http://yandex.st/highlightjs/8.0/styles/default.min.css"}]
          [:script {:src "http://yandex.st/highlightjs/8.0/highlight.min.js"}]
          [:style "
body {
    /*padding-top: 40px;*/
}

div#contents {
    margin-left: 10%;
    margin-right: 10%;
}

div.status {
    font-family: 'Arvo', serif;
    font-size: 15px;
    position: fixed;
    top: 10px;
    left: 50%;
    width: 600px;
    margin-left: -300px;
    padding: 10px;
    text-align: center;
    box-shadow: 0 0 10px steelblue;
    border-style: solid;
    border-color: #888888;
    border-width: 1px;
    background-color: #F1F1F1;
    z-index: 100;
}

div.commands {
    position: fixed;
    z-index: 100;
    top: 10px;
    right: 10px;
    font-family: 'Arvo', serif;
    font-weight: bold;
    font-size: 25px;
    opacity: 0.1;
}

div.commands:hover {
    opacity: 1;
}

div.commands div.command-contents {
    display: none;
    position: fixed;
    top: 20px;
    right: 40px;
    width: 350px;
    padding: 0;
    background: #eeeeee;
    box-shadow: 0 0 20px steelblue;
    border-style: solid;
    border-color: #888888;
    border-width: 1px;
    font-family: 'Helvetica', sans-serif;
    font-weight: normal;
    font-size: 13px;
}

div.commands:hover div.command-contents {
    display: block;
}

div.command-contents ul {
    margin: 0;
    padding: 0;
}

div.command-contents li {
    padding: 8px;
    background: #e5e5e5;
    list-style-type: none;
}

div.command-contents li:nth-child(odd) {
    background: #eeeeee;
}

div.command-shortcut {
    padding-top: 5px;
    font-family: 'lucida console', sans-serif;
    font-size: 11px;
    color: #555555;
}

h1 {
    margin-bottom: 0.3em;
}

div.segment {
    padding: 0.5em;
    margin: 0.2em 0.2em 0.2em 0.2em;
    border-style: solid;
    border-width: 1px;
    border-color: #cccccc;
}


div.free {
    background-color: #ffffff;
    border-style: none;
    padding: 0em 0.5em 0em 0.5em;
    font-family: 'Lora', serif;
    margin-top: 0.5em;
}

div.free h1,h2,h3,h4,h5 {
    font-family: 'Arvo', serif;
    color: #4682b4;
}

div.free p {
    padding-left: 0.5em;
}

div.free-markup div.CodeMirror {
    font-size: 14px;
    padding: 0.5em;
}

div.code {
    background-color: #eeeeee;
    margin: 0.5em 1.5em 0.2em 1.5em;
    padding: 0.2em;
}

div.code .segment-main {
    padding: 0.5em;
    overflow: hidden;
}

div.output {
    padding: 0.5em 1em 0.5em 1em;
    border-style: solid;
    background-color: white;
    border-width: 1px;
    border-color: #cccccc;
}

div.html-output {
    padding-top: 1em;
    padding-bottom: 1em;
}

div.output pre {
    font-family: monospace;
    white-space: pre-wrap;
}

div.error-text {
    font-family: monospace;
    border-style: solid;
    border-width: 1px;
    border-color: #ff0000;
    color: #ff0000;
    clear: both;
    padding: 0.5em 1em 0.5em 1em;
    margin-bottom: 0.3em;
    background-color: #FCE4E8;
}

div.console-text {
    padding: 0.5em 1em 0.5em 1em;
    margin-bottom: 0.3em;
    font-family: monospace;
    font-size: 12px;
    color: steelblue;
    border-color: #cccccc;
    border-style: solid;
    border-width: 1px;
    background-color: #FFFFFF;
}

div.console-text pre {
    white-space: pre-wrap;
}

div.vega {
    vertical-align: middle;
    display: inline-block;
}

canvas.marks {
    display: inline-block;
}

div.segment-footer {
    clear: both;
}

/* So named to avoid conflict with bootstrap container */
div.container-segment {
    border-style: none;
}

div.selected {
    outline-style: solid;
    outline-width: 1px;
    outline-color: #FF29D2;
}

:focus {
    outline: none;
}

.code-warning {
    box-shadow: 0 0 10px red;
}

.live {
    box-shadow: 0 0 10px #FF29D2;
}

/* Hack for FF as it puts the outline around the box-shadow :-( */
@-moz-document url-prefix() {
    .live {outline-offset: -15px}
}


.browser-muted {
    opacity: 0.5;
}

div.running {
    background-color: #d9ffd9;
}

div.last-chance {
    width: 100%;
}

textarea.last-chance {
    width: 100%;
    height: 80px;
    resize: none;
}

.scroll-pad {
    padding-bottom: 200px;
}

.CodeMirror {
    height: auto;
    background: none;
}

.CodeMirror-scroll {
    height: auto;
    overflow-y: hidden;
    overflow-x: auto;
    width: 100%
}"]]
         [:body
          [:div.content segments]]]))

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
                           [:div.code-segment
                            (if-not (empty? code-segment)
                              (cons
                               (render-clojure-code
                                (first code-segment))
                               (rest code-segment))
                              code-segment)])))
         
         :consoleSection (fn [& xs]
                           (html
                            [:div.console
                             (uncomment
                              (first
                               (remove-open-close-tags xs
                                                       :consoleOpenTag
                                                       :consoleCloseTag)))]))
         
         :outputSection (fn [& xs]
                          (html
                           [:div.output
                            ((parse-string
                              (uncomment
                               (first
                                (remove-open-close-tags xs
                                                        :outputOpenTag
                                                        :outputCloseTag))))
                             "content")]))
         
         :stringNoDelim (fn [& xs]
                          (apply str (map second xs)))})))


