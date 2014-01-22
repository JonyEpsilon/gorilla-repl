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

freeSegment = freeSegmentTag content:stringNoDelim? freeSegmentTag {return freeSegment(unmakeClojureComment(content));}

freeSegmentTag = ";; **\n"

codeSegment = codeSegmentTag content:stringNoDelim? cs:consoleSection? out:outputSection? codeSegmentTag
                {return codeSegment(content, unmakeClojureComment(cs), unmakeClojureComment(out));}

codeSegmentTag = ";; @@\n"

outputSection = outputOpenTag output:stringNoDelim outputCloseTag {return output;}

outputOpenTag = ";; =>\n"

outputCloseTag = ";; <=\n"

consoleSection = consoleOpenTag cs:stringNoDelim consoleCloseTag {return cs;}

consoleOpenTag = ";; ->\n"

consoleCloseTag = ";; <-\n"

stringNoDelim = cs:noDelimChar+ {return cs.join("");}

delimiter = freeSegmentTag / codeSegmentTag / outputOpenTag / outputCloseTag / consoleOpenTag / consoleCloseTag

noDelimChar = !delimiter c:. {return c;}