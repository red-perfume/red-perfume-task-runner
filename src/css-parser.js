const css = require('css');
const selectorParse = require('css-what').parse;

const helpers = require('./helpers.js');

const cssParser = function (input, options) {
  options = options || {};
  if (!input) {
    helpers.throwError('Invalid CSS input.');
    return;
  }

  const parseOptions = {
    silent: !options.verbose,
    source: undefined
  };
  const parsed = css.parse(input, parseOptions);

  if (parsed && parsed.stylesheet && parsed.stylesheet.rules) {
    parsed.stylesheet.rules.forEach(function (rule) {
      let parsedSelectors = selectorParse(rule.selectors.join(','));
      for (let i = 0; i < parsedSelectors.length; i++) {
        parsedSelectors[i][0]['original'] = rule.selectors[i];
      }
      rule.selectors = parsedSelectors;
    });
  }

  return parsed;
};

module.exports = cssParser;
