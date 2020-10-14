const css = require('./src/css.js');
const html = require('./src/html.js');

// To be atomized
const styles = `
.cow,
.cat {
    font-size: 12px;
    padding: 8px;
}
.dog {
    font-size: 12px;
    background: #F00;
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
