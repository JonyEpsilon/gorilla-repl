# The renderer

One of the central components of Gorilla is its renderer. It is the renderer that determines how Clojure values appear
when they are output, so it is ultimately responsible for things like plotting graphs, drawing tables and
matrices etc. as well as showing more mundane values like numbers and lists. You don't need to understand how the
renderer works to use Gorilla, but you might be interested anyway.
Gorilla's renderer is easily extensible, meaning you can customise Gorilla to show Clojure values in the way that's most
useful to you. This document will explain what you need to know to do that.

First, we'll look at the idea behind the renderer, then we'll work through the various stages in the rendering process.
After that, we'll look in detail at the stage of this process that you're most likely to customise. Finally we'll
present a sort of style guide, to help you figure out the best way to implement custom renderers for your values.

## The big idea

The essence of Gorilla is: run some Clojure code that evaluates to some value, and then show that value to the user. In
Gorilla, plotting a graph, or showing a table isn't a side-effect of your code - it's just a nice way of looking at the
value your code produces. You could say that Gorilla is fundamentally value-based. Being strictly value-based like this
a limitation, but it's an empowering limitation: it makes it possible to compose and aggregate rendered objects just
like you compose and aggregate Clojure values, to save worksheets with their rendered output intact, and even to
manipulate the output of worksheets that
you haven't/can't run. It should be stated for balance that there are some things that Gorilla's value-based rendering
is not great at, like rapidly updating plots with many data points for instance, but it will hopefully do much of what
you want to get done, and do it elegantly!

## From evaluation to screen

So, how does a value get transformed into what you see on screen? And how do things like rendering an aggregate of
values (say, a table of plots) work?

There are three steps to the evaluation and rendering process in Gorilla:

- When you press `shift+enter`, the first step is to run the Clojure code you've provided to get its value. This happens
  exactly as it would in an nREPL terminal session.
- The second step is the main rendering step. Here the result of the evaluation is transformed into a second Clojure
  value that represents what should be drawn for the output. This step happens inside a piece of nREPL middleware, and
  is exactly analogous to what terminal-based nREPL does when it calls `pr` on the value before sending it to the
  client. Except that here we're not transforming from a value to a string that represents the value, as `pr` does, but
  rather transforming into a much richer structure. We call this richer structure the rendered representation. We'll
  look at this step in detail below.
- The value from the second step is sent to the Gorilla client, running in the web-browser, as JSON. The third and final
  step of the process is the web-browser processing this structure to turn it into a DOM fragment that the browser can
  display. It's likely that you won't need to get involved in this step of the process.

### The render protocol

Let's look at the second step of the evaluation-rendering process in more detail. Gorilla carries out this process
rather simply by calling a single function, `gorilla-renderable.core/render`, on the value. This is the sole
function in the `Renderable` protocol, found in the `gorilla-renderable.core` namespace. This namespace lives in its own
tiny project, with no dependencies, so supporting Gorilla rendering is a very light addition to your project.

The `render` function takes the value and returns its rendered representation. We'll specify the form of this rendered
representation below, but it might be something like:
```clojure
{:type :html :contents "<span class='clj-long'>3</span>" :value "3"}
```
This rendered form will tell the client that the value should be rendered as an HTML fragment, and gives the contents of
that fragment. Note that it also includes a readable representation of the value, as would be obtained from `pr`ing it,
which is used by the client to implement value copying-and-pasting.

This explains how individual values are rendered, but what about aggregates of values? What if the result of our
evaluation was `[1 2 3]` or a list of plots? The first part of the answer is easy: when implementing the `render`
function for aggregates we recursively call `render` on each of the children. But how do we then combine those rendered
values together to form the final value?

Our first attempt at implementing the render function for aggregates might look like this: we call render on the
elements of the aggregate, generating HTML fragments as above, and then we assemble these HTML fragments into an HTML
fragment representing the list:
```clojure
{:type :html
 :contents "<span class='clj-list'>[</span><span class='clj-long'>1</span> ... <span class='clj-list'>]</span>"
 :value "[1 2 3]"}
```
This is nice and simple, and works well in this case, but it has a number of problems:

- Let's consider rendering a list of plots for instance. To understand the problem here we need to understand how
  plots are rendered on the client: which is by inserting a placeholder element into the DOM, and then calling
  the javascript plotting library which transforms that placeholder into the plot as a side-effect. This
  is a common pattern with javascript libraries (the LaTeX library works this way too, for instance), so we need to
  support it. For a large output there might be a large number of placeholders, and javascript functions to fire, and we
  need to manage this complexity.
- We want to support value copy-and-paste, where the user can interact with a rendered object, and copy its Clojure
  value. To implement this the front end needs to know, in some way, the structure of the Clojure expression and how it
  corresponds to the rendered value.
- We might in the future want to support in-place updates to the rendered output. This means being able to select part
  of the output that corresponds to a part of the original Clojure expression and modify it.

The approach that Gorilla takes to solve these problems is to defer the reassembly of the HTML fragments to the client.
To support this, the rendered representation needs some notion of an aggregate, and this is captured by the `:list-like`
render type. In this way, the front-end has some information on how the value is composed out of sub-values, which helps
solve the above problems. So in fact the rendered representation for the value `[1 2 3]` is:
```clojure
{:type :list-like,
 :open "<span class='clj-vector'>[<span>",
 :close "<span class='clj-vector'>]</span>",
 :separator " ",
 :items
 ({:type :html, :content "<span class='clj-long'>1</span>", :value "1"}
  {:type :html, :content "<span class='clj-long'>2</span>", :value "2"}
  {:type :html, :content "<span class='clj-long'>3</span>", :value "3"}),
 :value "[1 2 3]"}
```
Rather verbose you might think, but very regular, and quite powerful!

So, in summary, values are rendered in Gorilla by calling the `render` function of the `Renderable` protocol on them.
This transforms the value into a "rendered representation" that the front end can process to produce the final output.
This rendered representation preserves the identity of the various parts of the Clojure value, and supports aggregates
directly with `:list-like`, making it straightforward to render complex values, and enabling value copy-and-paste.

### Rendered representation reference

For reference, here is a specification of the rendered representation. A valid value in the rendered representation is
one of:

```clojure
{:type :html :contents "some html" :value "pr'ed value"}
```
This is the simplest, representing a raw HTML fragment that represents the value.

```clojure
{:type :vega :content <<vega spec>> :value "pr'ed value"}
```
This represents a Vega visualisation. `<<vega spec>>` should be a value that, when converted to json, is a valid Vega
spec.

```clojure
{:type :latex :contents "some latex" :value "pr'ed value"}
```
Represents a fragment of LaTeX. Will be displayed inline. You do not need the MathJAX delimiters ($$ or @@).

```clojure
{:type :list-like,
 :open "opening string",
 :close "closing string",
 :separator "separator string",
 :items <<seq of items>>,
 :value "pr'ed value"}
```
Represents a general aggregate of values. `<<seq of items>>` is a sequence of valid rendered representation values.
List-likes can be nested, which is how nested lists and maps are rendered.

## Extending the renderer

Okay, now you've suffered through that you should have a pretty good idea of how the renderer works. Let's look at how
you might extend it to support your own values. At the risk of sounding facile, how you do that depends on what
you want achieve. We can divide the sorts of thing you might want to render in to three broad classes:

- things that only really make sense when rendered specially;
- things that are useful when rendered as plain Clojure values, but can gain something by being rendered specially;
- and things that don't need any special rendering.

Examples in these classes might be: a plot, or an image; a matrix; a number. It's important to decide from the outset
where the value you want to render fits into this classification.

In the following we'll go through some guidelines for how you should approach rendering for each of these classes. You
should think of these guidelines as something like a style guide: you don't have to follow them, but if you do your code
will fit more naturally with other things in Gorilla.

### Things that are always rendered specially

For the first class of things - things that only make sense when rendered specially - it's unlikely that the user is
particularly interested in the underlying value. So the default should be that the value is rendered specially. And
because Gorilla dispatches the `render` function on the type of the argument, this means that the value will have to
have a distinct type. Sometimes this will happen naturally, say if you already had a record type that represented a PNG
image. But sometimes you'll have to implement a wrapper-type solely for the purpose of Gorilla rendering. Either way,
the set of things that need to be done is more-or-less the same. Consider as an example
the function `list-plot` from gorilla-plot. It is called with a list of data, and the output
is shown as a plot in the Gorilla notebook. Let's walk through the steps in this process:

- `list-plot` evaluates to a `Vega` record, of the form `#gorilla_repl.vega.Vega{:content <<vega spec>>}`.
  In this case, the `Vega` record type exists solely as a wrapper to indicate to Gorilla how to do the rendering. But in
  other cases, the record type could be the
  'natural' return type of the function, with other reasons for existing than just directing the rendering;
- The rendering middleware will call `render` on this value as described above;
- In the `gorilla-repl.vega` namespace there is a custom renderer defined for `Vega` records, which renders the record
  to a `{:type :vega, :content <<vega spec>>}` value in the rendered representation. This renderer is brought into
  scope whenever the gorilla-plot library is used.

The important things to note are: the user-facing functions (`list-plot` here) directly generate values that have
a record type that informs the renderer how to render them; and the renderer is automatically brought into
scope when the library is loaded. These two things give the user the experience they expect, that is when they run a
plot command, a plot appears.

The `list-plot` example above uses a wrapper type, `Vega`, whose sole purpose is to enable the rendering. While
returning a wrapped value like this from user-facing code gives a good user experience, there is a price to pay which is
that the values
have to be unwrapped in order to work with them further. Taking the `compose` function in gorilla-plot as an example,
which tries to combine multiple plots onto one set of axes: it must first unwrap the individual Vega specs by extracting
them from the `Vega` records, then compose the plot data together, and finally re-wrap into a new `Vega` record so that
the result will be rendered as a plot. Weighing this extra work off against the user expectation of automatic rendering
is the key design decision to make concerning wrapper types.

### Things that are sometimes rendered specially

The second class of things, where both the raw Clojure value and specially rendered values are meaningful, is more
interesting. Here we want to give the user choice as to how the value is rendered. The following approach is
recommended:

- functions manipulating the values should work with 'raw' values that don't implement the render protocol specially.
  This is quite likely already the case, as the code you are writing a renderer for is probably not Gorilla specific;
- these plain, unwrapped Clojure values will be rendered plainly by the default renderer, usually giving a `read`able
  output;
- you should provide view functions, following the naming pattern `*-view` to specially render the value. These view
  function should probably live in a separate namespace from the function for actually working with the raw values.
  Depending on how you want to manage the dependencies for your project, these functions might even live in their own
  project;
- these view functions should wrap the raw value in a wrapper record-type to indicate how it should be rendered;
- you should implement `Renderable` for the record type to do the actual rendering. This implementation should be
  brought into scope when the view functions are loaded.

This approach is nice, because it puts the control of the rendering in the hands of the user, allowing them to view the
value in the way that is most useful to them. You can provide more than one view function for a given type of
value, and these view functions can take options to configure the rendering. You might implement this with multiple
wrapper types if need be.

Let's make the discussion concrete by considering a renderer for a fictional 2D-matrix library. Let's say this library
has functions for manipulating matrices that are stored as simple nested Clojure vectors. As discussed in the first
two points of the list above, these library functions know nothing about rendering, and the values will be rendered by
the default renderer as simple nested vectors. We will implement
two view functions for these matrices `matrix-view` and `abridged-matrix-view` (catchy name, eh?).
Both will format the matrices as a 2D grid, and the latter will only show a subset of the data, suitable for large
matrices. The rendering code might look like:
```clojure
(ns my-matrix.renderer
  (:require [gorilla-renderable.core :as render]))

;; The wrapper type for the renderer
(defrecord MatrixView [contents])

;; this view function renders the matrix in 2D grid form
(defn matrix-view [m] (MatrixView. m))

(extend-type MatrixView
  Renderable
  (render [self] <<rendering code here>>))

;; A second wrapper type for indicating an abridged form should be rendered
;; the opts will be used to store render specific options, like how many values to show say
(defrecord AbridgedMatrixView [contents opts])

;; this view function renders the matrix in 2D grid form, it takes options to control the rendering
(defn abridged-matrix-view [m & opts] (AbridgedMatrixView. m opts))

(extend-type AbridgedMatrixView
  Renderable
  (render [self] <<rendering code here>>))
```
Hopefully this toy example gives you an idea of how your rendering code might be structured for values that can rendered
in multiple ways.

### Things that are never rendered specially

This final class of things is easy - Gorilla's built-in renderer will take care of this!


## Conclusion

We've covered a lot in this document, but hopefully it gives you a solid grounding in the way the renderer works, and
has some useful suggestions for implementing your own rendering functions. You're encouraged to implement renderers for
your data and share them - if you need any help with this, please don't hesitate to get in touch.