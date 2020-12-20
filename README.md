# Red Perfume

[![Build Status](https://github.com/red-perfume/red-perfume/workflows/Build%20Status/badge.svg?branch=main)](https://github.com/red-perfume/red-perfume/actions?query=workflow%3A%22Build+Status%22+branch%3Amain) [![Coverage Badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/TheJaredWilcurt/9c5d16fe3fa8f8ef414fe8b0eff17f7f/raw/red-perfume__heads_main.json)](https://github.com/red-perfume/red-perfume/actions?query=workflow%3A%22Build+Status%22+branch%3Amain) [![Lint Coverage: 100%](https://img.shields.io/badge/Lint%20Coverage-100%25-brightgreen.svg?logo=eslint)](https://github.com/tjw-lint) [![Code of Conduct: No Ideologies](https://img.shields.io/badge/CoC-No%20Ideologies-blue)](/CODE_OF_CONDUCT.md) [![MIT Licensed](https://img.shields.io/badge/License-MIT-brightgreen)](/LICENSE)


## Feedback

Leave feedback as an issue or a response [on Twitter](https://twitter.com/TheJaredWilcurt/status/1316205761047998471).


## **Star** and **Watch** this repo for updates.

Or follow me on [Twitter](https://twitter.com/TheJaredWilcurt) if that's easier.


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

This above example already works as a proof of concept with the current code. However, the library needs a lot more work to be usable in most projects. Look at the **issues** page to see what work is left to be done and how you can help!


## API (subject to change before v1.0.0)

### API Example

```js
const redPerfume = require('red-perfume');

redPerfume.atomize({
  verbose: true,
  customLogger: function (message, err) {
    console.log(message, err);
  },
  tasks: [
    {
      uglify: false,
      styles: {
        in: [
          './styles/file.css',
          './styles/style.css'
        ],
        // The two above files will be atomized and combined into this output
        out: './dist/styles/styles.css'
      },
      // The output markup will be a copy of the input but modified to have the class names replaced to match the new atomized styles from styles.out
      markup: [
        {
          in: './index.html',
          out: './dist/index.html'
        },
        {
          in: './contact.html',
          out: './dist/contact.html'
        }
      ],
      scripts: {
        out: './dist/atomic-styles.json'
      }
    },
    {
      uglify: true,
      styles: {
        data: '.example { padding: 10px; margin: 10px; }',
        result: function (result, err) {
          // .rp__a { padding: 10px } .rp__b { margin: 10px }
          console.log(result);
        }
      },
      markup: [
        {
          data: '<!DOCTYPE html><html><body><div class="example"></div></body></html>',
          result: function (result, err) {
            // '<!DOCTYPE html><html><body><div class="rp__a rp__b"></div></body></html>'
            console.log(result);
          }
        }
      ],
      scripts: {
        result: function (result, err) {
          // { '.example': [ '.rp__a', '.rp__b' ] }
          console.log(result);
        }
      }
    }
  ]
});
```


### API Implementation Status

* 🌑🌑🌑🌑 Not started
* 🌕🌑🌑🌑 Validation in place
* 🌕🌗🌑🌑 In Progress
* 🌕🌕🌑🌑 Implemented
* 🌕🌕🌕🌑 Tested
* 🌕🌕🌕🌕 Released

Key                   | Status  | Details
:--                   | :--     | :--
`verbose`             | 🌕🌕🌑🌑 | Implemented
`customLogger`        | 🌕🌕🌑🌑 | Implemented
`tasks`               | 🌕🌑🌑🌑 | API Validated
`task.uglify`         | 🌕🌗🌑🌑 | Base functionality implemented, advanced features planned
`task.styles`         | 🌕🌑🌑🌑 | API Validated
`task.markup`         | 🌕🌑🌑🌑 | API Validated
`task.scripts`        | 🌕🌑🌑🌑 | API Validated
`task.styles.in`      | 🌕🌑🌑🌑 | API Validated
`task.styles.out`     | 🌕🌑🌑🌑 | API Validated
`task.styles.data`    | 🌕🌕🌑🌑 | Implemented
`task.styles.result`  | 🌕🌕🌑🌑 | Implemented
`task.markup.in`      | 🌕🌑🌑🌑 | API Validated
`task.markup.out`     | 🌕🌑🌑🌑 | API Validated
`task.markup.data`    | 🌕🌕🌑🌑 | Implemented
`task.markup.result`  | 🌕🌕🌑🌑 | Implemented
`task.scripts.out`    | 🌕🌕🌑🌑 | Implemented
`task.scripts.result` | 🌕🌕🌑🌑 | Implemented


### API Documentation

Key             | Type     | Allowed          | Default         | Description
:--             | :--      | :--              | :--             | :--
`verbose`       | Boolean  | `true`, `false`  | `true`          | If true, consoles out helpful warnings and errors using `customLogger` or `console.error`.
`customLogger`  | Function | Any function     | `console.error` | You can pass in your own custom function to log errors/warnings to. When called the function will receive a `message` string for the first argument and sometimes an `error` object for the second argument. This can be useful in scenarios like adding in custom wrappers or colors in a command line/terminal. This function may be called multiple times before all tasks complete. Only called if `verbose` is true.
`tasks`         | Array    | Array of objects | `undefined`     | An array of task objects. Each represents the settings for an atomization task to be performed.

**Tasks API:**

Key       | Type    | Default     | Description
:--       | :--     | :--         | :--
`uglify`  | Boolean | `false`     | If `false` the atomized classes, and all references to them, are long (`.rp__padding__--COLOR12px`). If `true` they are short (`.rp__b5p`).
`styles`  | Object  | `undefined` | CSS settings. API below
`markup`  | Array   | `undefined` | HTML settings. An array of objects with their API defined below
`scripts` | Object  | `undefined` | JS settings. API below

**Styles Task API:**

Key       | Type     | Default     | Description
:--       | :--      | :--         | :--
`in`      | Array    | `undefined` | An array of strings to valid paths for CSS files. All files will remain untouched. A new atomized string is produced for `out`/`result`.
`out`     | String   | `undefined` | A string file path output. If file exists it will be overwritten with the atomized styles from `in` and/or `data`
`data`    | String   | `undefined` | A string of CSS to be atomized. Atomized styles are passed to `out` and `result`.
`result`  | Function | `undefined` | A function, if supplied, will be called with the combined atomized results from `data` and the files form `in` as the first argument, and an error for the second argument. You can create a promise in this function to be returned if you like.

**Markup Task API:**
Key       | Type     | Default     | Description
:--       | :--      | :--         | :--
`in`      | String   | `undefined` | Path to an HTML file.
`out`     | String   | `undefined` | Path where the modified version of the `in` file will be stored. If file already exists, it will be overwritten.
`data`    | String   | `undefined` | A string of markup to be processed. This is ignored there is a valid HTML file passed to `in`
`result`  | Function | `undefined` | A function, if supplied, will be called with the processed string version of the markup from `in` or `data` as the first argument, and an error for the second argument. You can create a promise in this function to be returned if you like.

**Scripts Task API:**
Key       | Type     | Default     | Description
:--       | :--      | :--         | :--
`out`     | String   | `undefined` | Path where a JSON object will be stored. The object contains keys (selectors) and values (array of strings of atomized class names). If file already exists, it will be overwritten.
`result`  | Function | `undefined` | A function, if supplied, will be called with the JSON object as first argument, and an error for the second argument. You can create a promise in this function to be returned if you like.


## Running locally to see the proof of concept or contribute

1. Install [Node.js](https://nodejs.org) & npm
1. Download or fork or clone the repo
1. `npm install`
1. `node manual-testing.js`


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
