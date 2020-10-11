
const parse5 = require('parse5');

const originalString = `<!DOCTYPE html>
<html>
  <head>
  <style>
  .cool { background: #F00; }
  .cow {
    display: flex;
    border: 1px solid #F00;
    text-align: center;
  }
  </style>
  </head>
  <body>
    <p class="cool cow moo">Hi there!</p>
    <!--
      <span class="dog">asdf</span>
    -->
    <h1 class="cool nice wow">asdf</h1>
  </body>
</html>`;

// String => Object
const document = parse5.parse(originalString);

// Parent nodes are circular and don't allow you to JSON.stringify
function removeParentNodes (node) {
  delete node.parentNode;
  if (node.childNodes) {
    node.childNodes.forEach(function (child) {
      removeParentNodes(child);
    });
  }
}
removeParentNodes(document);
console.log(JSON.stringify(document, null, 2));

function removeEveryInstance (arr, value) {
  let i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}

function replaceCoolWithYES (node) {
  if (node.attrs) {
    node.attrs.forEach(function (attribute) {
      if (attribute.name === 'class') {
        let classes = attribute.value.split(' ');
        if (classes.includes('cool')) {
          classes = removeEveryInstance(classes, 'cool');
          classes.push('y', 'e', 's');
        }
        attribute.value = classes.join(' ');
      }
    });
  }
  if (node.childNodes) {
    node.childNodes.forEach(function (child) {
      replaceCoolWithYES(child);
    });
  }
}
replaceCoolWithYES(document);

// Object => string
const html = parse5.serialize(document);

function oneLiner (string) {
  return string
    .split('\n')
    .map(function (line) {
      return line.trim();
    })
    .join('');
}

console.log(html);
console.log(oneLiner(html) === oneLiner(originalString));



/*
Can loop over all elements and find all classes.
Can replace a class with atomic classes.
Can output HTML, though some whitespace changes occur from parse5.
Probably unimportant since this is a build step, and minified html will either be passed or the result will be minified.

Still need to parse CSS and actually atomize it.
Also need to set up JS approach.
*/
