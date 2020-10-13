const cssParser = require('./src/css-parser.js');
const cssStringify = require('./src/css-stringify.js');
const encodeClassName = require('./src/class-encoding.js');

const parsed = cssParser('.cow { font-size: 12px; padding: 8px; } .dog { backgroud: #F00; content: ")(*&^%$#@!" }');

const output = {
  type: 'stylesheet',
  stylesheet: {
    rules: [],
    parsingErrors: []
  }
};


const classMap = {};

parsed.stylesheet.rules.forEach(function (rule) {
  rule.declarations.forEach(function (declaration) {
    let encodedClassName = encodeClassName(declaration);
    classMap[rule.selectors[0][0].original] = classMap[rule.selectors[0][0].original] || [];
    classMap[rule.selectors[0][0].original].push(encodedClassName);

    output.stylesheet.rules.push({
      type: 'rule',
      selectors: [[encodedClassName]],
      declarations: [declaration]
    });
  });
});

console.log(JSON.stringify(classMap, null, 2));
console.log(cssStringify(output));
