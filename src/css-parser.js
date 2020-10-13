const css = require('css');
const selectorParse = require('css-what').parse;

const cssParser = function (input) {
  const options = {
    silent: false,
    source: undefined
  };
  const parsed = css.parse(input, options);

  if (parsed && parsed.stylesheet && parsed.stylesheet.rules) {
    parsed.stylesheet.rules.forEach(function (rule) {
      let parsedSelectors = selectorParse(rule.selectors.join(','));
      for (let i = 0; i < parsedSelectors.length; i++) {
        parsedSelectors[0][i]['original'] = rule.selectors[i];
      }
      rule.selectors = parsedSelectors;
    });
  }

  return parsed;
};

module.exports = cssParser;
