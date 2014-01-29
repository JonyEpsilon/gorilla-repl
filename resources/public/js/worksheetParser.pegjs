/*
 * This file is part of gorilla-repl. Copyright (C) 2014, Jony Hudson.
 *
 * gorilla-repl is licenced to you under the MIT licence. See the file LICENCE.txt for full details.
 */

// The parser takes a worksheet persisted as a marked up clojure file and returns a list of segments.

worksheet = worksheetHeader seg:segmentWithBlankLine* {return seg;}

worksheetHeader = ";; gorilla-repl.fileformat = 1\n\n"

segmentWithBlankLine = seg:segment "\n"? {return seg;}

segment = freeSegment / codeSegment

freeSegment = freeSegmentOpenTag content:stringNoDelim? freeSegmentCloseTag
                {return freeSegment(unmakeClojureComment(content));}

freeSegmentOpenTag = ";; **\n"

freeSegmentCloseTag = "\n;; **\n"

codeSegment = codeSegmentOpenTag content:stringNoDelim? codeSegmentCloseTag cs:consoleSection? out:outputSection?
                {return codeSegment(content, unmakeClojureComment(cs), unmakeClojureComment(out));}

codeSegmentOpenTag = ";; @@\n"

codeSegmentCloseTag = "\n;; @@\n"

outputSection = outputOpenTag output:stringNoDelim outputCloseTag {return output;}

outputOpenTag = ";; =>\n"

outputCloseTag = "\n;; <=\n"

consoleSection = consoleOpenTag cs:stringNoDelim consoleCloseTag {return cs;}

consoleOpenTag = ";; ->\n"

consoleCloseTag = "\n;; <-\n"

stringNoDelim = cs:noDelimChar+ {return cs.join("");}

delimiter = freeSegmentOpenTag / freeSegmentCloseTag /codeSegmentOpenTag / codeSegmentCloseTag / outputOpenTag /
                outputCloseTag / consoleOpenTag / consoleCloseTag

noDelimChar = !delimiter c:. {return c;}