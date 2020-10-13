const css = require('./css.js');
const html = require('./html.js');

// To be atomized
const styles = `
.cow,
.cat {
    font-size: 12px;
    padding: 8px;
}
.dog {
    font-size: 12px;
    backgroud: #F00;
    padding: 8px;
}`;

// Original classes ot be replaced with atomized versions
const markup = `<!DOCTYPE html>
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
</html>`;



const processedStyles = css(styles);
const updatedMarkup = html(markup, processedStyles);

console.log(processedStyles.classMap)
console.log(processedStyles.output)
console.log(updatedMarkup);


/*
Can loop over all elements and find all classes.
Can replace a class with atomic classes.
Can output HTML, though some whitespace changes occur from parse5.
Probably unimportant since this is a build step, and minified html will either be passed or the result will be minified.

Still need to parse CSS and actually atomize it.
Also need to set up JS approach.
*/
