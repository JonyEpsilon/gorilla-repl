# The renderer

One of the central components of Gorilla is its renderer. It is the renderer that determines how Clojure values appear
when they are output, so it is ultimately responsible for things like plotting graphs, drawing tables and
matrices etc. You don't need to understand how the renderer works to use Gorilla, but you might be interested anyway.
Gorilla's renderer is easily extensible, meaning you can customise Gorilla to show Clojure values in the way that's most
useful to you. This document will explain what you need to know to do that.

Document summary here.

## Renderer overview

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
  rather transforming into a much richer structure. We'll look at this step in detail below.
- The value from the second step is sent to the Gorilla client, running in the web-browser, as JSON. The third and final
  step of the process is the web-browser processing this structure to turn it into a DOM fragment that the browser can
  display. It's likely that you won't need to get involved in this step of the process.

### The render protocol

Let's look at the second step of the evaluation-rendering process in more detail. Gorilla carries out this process
rather simply by calling a single function, `gorilla-renderable.core/render`, on the value. This function is the sole
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
evaluation was `[1 2 3]` or a list of plots? The essence of the answer is that when implementing the `render` function
for aggregates we recursively call `render` on each of the children. The detail of how the rendered values are combined
is a bit confusing though, and to appreciate why we need to take a short diversion into how the rendering is done on the
client side.

Our first attempt at implementing the render function for aggregates might look like this: we call render on the
elements of the aggregate, generating HTML fragments as above, and then we assemble these HTML fragments into an HTML
fragment representing the list:
```clojure
{:type :html
:contents "<span class='clj-list'>[</span><span class='clj-long'>3</span> ... <span class='clj-list'>]</span>"
:value "[1 2 3]"}
```
This is nice and simple, and works well in this case, but it breaks down when we try and do something more complicated.
Let's consider rendering a list of plots for instance. To understand the problem we need to understand how plots are
rendered on the client. Plots are rendered using the Vega library, and it works

### Rendered representation reference


### The final step


## Extending the renderer

