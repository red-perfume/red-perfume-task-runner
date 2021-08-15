const css = require('css');

/**
 * Takes in a CSS AST and turns it into a string of CSS.
 *
 * @param  {object} input  A CSS Abstract Syntax Tree (AST)
 * @return {string}        Valid CSS (not minified)
 * @example
 */
function cssStringify (input) {
  if (
    typeof(input) !== 'object' ||
    Array.isArray(input) ||
    !input.stylesheet ||
    !input.stylesheet.rules
  ) {
    return '';
  }

  const options = {};
  const styles = css.stringify(input, options);

  return styles
    .split('}\n\n')
    .join('}\n');
}

module.exports = cssStringify;
