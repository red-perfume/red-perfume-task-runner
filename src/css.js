const cssParser = require('./css-parser.js');
const cssStringify = require('./css-stringify.js');
const encodeClassName = require('./class-encoding.js');

const css = function (options, input) {
  const parsed = cssParser(options, input);

  const output = {
    type: 'stylesheet',
    stylesheet: {
      rules: [],
      parsingErrors: []
    }
  };

  const classMap = {};
  const newRules = {};

  parsed.stylesheet.rules.forEach(function (rule) {
    rule.declarations.forEach(function (declaration) {
      let encodedClassName = encodeClassName(declaration);

      rule.selectors.forEach(function (selector) {
        classMap[selector[0].original] = classMap[selector[0].original] || [];
        classMap[selector[0].original].push(encodedClassName);
      });

      newRules[encodedClassName] = {
        type: 'rule',
        selectors: [[encodedClassName]],
        declarations: [declaration]
      };
    });
  });

  Object.keys(newRules).forEach(function (key) {
    output.stylesheet.rules.push(newRules[key]);
  });

  return {
    classMap: classMap,
    output: cssStringify(output)
  };
};

module.exports = css;
