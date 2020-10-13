const css = require('css');

function cssStringify (input) {
  const options = {};
  const styles = css.stringify(input, options)

  return styles
    .split('}\n\n')
    .join('}\n');
}

module.exports = cssStringify;
