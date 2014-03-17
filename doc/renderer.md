# The renderer

One of the central components of Gorilla is its renderer. It is the renderer that determines how Clojure values appear
when they are output, so it is ultimately responsible for things like plotting graphs, drawing tables and
matrices etc. You don't need to understand how the renderer works to use Gorilla, but you might be interested anyway.
Gorilla's renderer is easily extensible, meaning you can customise Gorilla to show Clojure values in the way that's most
useful to you. This document will explain what you need to know to do that.

Document summary here.

## The big idea

The essence of Gorilla is: run some Clojure code that evaluates to some value, and then show that value to the user. In
Gorilla, plotting a graph, or showing a table isn't a side-effect of your code - it's just a nice way of looking at the
value your code produces. You could say that Gorilla is fundamentally value-based. Being strictly value-based like this
a limitation, but it's an empowering limitation: it makes it possible to compose and aggregate rendered objects just
like you compose and aggregate Clojure values, to save worksheets with their rendered output intact, and even to
manipulate the output of worksheets that
you haven't/can't run. It should be stated for balance that there are some things that Gorilla's value-based rendering
is not great at, like rapidly updating plots with many data points, but it will hopefully do much of what you want to
get done, and do it elegantly!

## From `shift+enter` to screen

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
function in the `Renderable` protocol, found in the `gorilla-renderable.core` namespace.

The `render` function takes the value and returns its rendered representation. We'll look at the form of this rendered
representation below, but it might be something like:
```clojure
{:type :html :contents "<span class='clj-long'>3</span>" :value "3"}
```
This rendered form will tell the client that the value should be rendered as an HTML fragment, and gives the contents of
that fragment. Note that it also includes a readable representation of the value, as would be obtained from `pr`ing it,
which is used by the client to implement value copying-and-pasting.

This explains how individual values are rendered, but how about aggregates of values? What if the result of our
evaluation was `[1 2 3]` or a list of plots? The first part of the answer is easy: when implementing the `render`
function for aggregates we recursively call `render` on each of the children. But how do we then combine those rendered
values together to form the final value?

Our first attempt at implementing the render function for aggregates might look like this: we call render on the
elements of the aggregate, generating HTML fragments as above, and then we assemble these HTML fragments into an HTML
fragment representing the list:
```clojure
{:type :html
 :contents "<span class='clj-list'>[</span><span class='clj-long'>3</span> ... <span class='clj-list'>]</span>"
 :value "[1 2 3]"}
```
This is nice and simple, and works well in this case, but it has a number of problems:

- Let's consider rendering a list of plots for instance. To understand the problem here we need to understand how
plots are rendered on the client: which is by inserting a placeholder element into the DOM, and then calling
the javascript plotting library, which transforms that placeholder into the plot as a side-effect. This
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
render type. So in fact the rendered representation for the value `[1 2 3]` is:
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
directly, making it straightforward to render complex values, and enabling value copy-and-paste.

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
This represents a Vega visualisation. <<vega spec>> should be a value that, when converted to json, is a valid Vega
spec.

```clojure
{:type :latex :contents "some latex" :value "pr'ed value"}
```
Represents a fragment of LaTeX. Will be displayed inline.

```clojure
{:type :list-like,
 :open "opening string",
 :close "closing string",
 :separator "separator string",
 :items <<seq of items>>,
 :value "pr'ed value"}
```
Represents a general aggregate of values. <<seq of items>> is a sequence of valid rendered representation values.
List-likes can be nested, which is how nested lists and maps are rendered.

## Extending the renderer

