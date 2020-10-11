const css = require('css');
const options = {
  silent: false,
  source: undefined
};
const parsed = css.parse('.cow { font-size: 12px; }', options);

let rules = parsed && parsed.stylesheet && parsed.stylesheet.rules;

rules.forEach(function (rule) {
  console.log(rule);
});

