# Red Perfume


## Experimental CSS Atomizer (WIP)

This is a library for a build tool that helps to drastically reduce the total amount of CSS that is shipped for your project. Facebook adopted this atomized CSS approach and it [reduced their homepage CSS by **80%**](https://engineering.fb.com/web/facebook-redesign/). Twitter also atomizes their CSS.

With `red-perfume` you write your CSS however you like (semantic class names, BEM, utility classes, whatever). Then reference them in your HTML normally.

**Example:**

```css
.cow,
.cat {
    font-size: 12px;
    padding: 8px;
}
.dog {
    font-size: 12px;
    background: #F00;
    padding: 8px;
}
```
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <p class="cool cow moo">
      Hi there!
    </p>
    <!--
      <span class="dog">comments are skipped</span>
    -->
    <h1 class="cool cat nice wow">
      Meow
    </h1>
    <h2 class="dog">
      Woof
    </h2>
  </body>
</html>
```
Then `red-perfume` atomizes the styling into atomic classes, and replaces the references to them:
```css
.rp__font-size__--COLON12px {
  font-size: 12px;
}
.rp__padding__--COLON8px {
  padding: 8px;
}
.rp__background__--COLON__--OCTOTHORPF00 {
  background: #F00;
}
```
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <p class="cool moo rp__font-size__--COLON12px rp__padding__--COLON8px">
      Hi there!
    </p>
    <!--
      <span class="dog">comments are skipped</span>
    -->
    <h1 class="cool nice wow rp__font-size__--COLON12px rp__padding__--COLON8px">
      Meow
    </h1>
    <h2 class="rp__font-size__--COLON12px rp__background__--COLON__--OCTOTHORPF00 rp__padding__--COLON8px">
      Woof
    </h2>
  </body>
</html>
```

This output isn't as pretty to read, but it's a build step, *not* your source code, so it doesn't really matter. **Note:** [Uglification of classnames](https://github.com/red-perfume/red-perfume/issues/5) is on the TODO list.

This above example already works as a proof of concept with the current code. However, the library needs a lot more work to be usable in most projecta. Look at the **issues** page to see what work is left to be done and how you can help!


## Feedback

Leave feedback as an issue or a response [on Twitter](https://twitter.com/TheJaredWilcurt/status/1316205761047998471).

**Star** and **Watch** this repo for updates.


## Running locally to see the proof of concept or contribute

1. Install [Node.js](https://nodejs.org) & npm
1. Download or fork or clone the repo
1. `npm install`
1. `node index.js`


## Why is it called "Red Perfume"

This library takes in any CSS and breaks it down to pure Atomic CSS. This is a process called "CSS Atomization", and libraries that do this process are called "CSS Atomizers".

Outside of our industry jargon, "Atomizer" already exists as a word.

> **Atomizer** <sub><sup>(*NOUN*)</sup></sub>
> 1. A device for emitting water, perfume, or other liquids as a fine spray.
> 
> \- [Oxford English Dictionary](https://www.lexico.com/definition/atomizer)

Though actual atomizers themselves have no consistent size, design, color, or shape. So there is no iconic image that represents them.

![Example of several atomizers of differnt size, shape, color and design](atomizer-comparison.jpg)

And though perfume bottles can also come in many shapes, colors, sizes and designs, they are still recognizable as perfume bottles.
