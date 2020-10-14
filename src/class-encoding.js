// Initially I thought this too verbose, but there is literally no limit on class lengths other than the machine's memory/CPU.
// Firefox actually let me create and reference a classname with 100,000,000 characters. It was slow, but it worked fine.
const propertyValueEncodingMap = {
  '&': '__--AMPERSAND',
  '*': '__--ASTERISK',
  '@': '__--ATSIGN',
  '\\': '__--BACKSLASH',
  '^': '__--CARET',
  '¢': '__--CENT',
  '>': '__--CLOSEANGLEBRACKET',
  '}': '__--CLOSECURLYBRACE',
  ')': '__--CLOSEPAREN',
  ']': '__--CLOSESQUAREBRACKET',
  ':': '__--COLON',
  ',': '__--COMMA',
  '©': '__--COPYRIGHT',
  '¤': '__--CURRENCY',
  '°': '__--DEGREE',
  '÷': '__--DIVIDE',
  '$': '__--DOLARSIGN',
  '.': '__--DOT',
  '"': '__--DOUBLEQUOTE',
  '=': '__--EQUAL',
  '!': '__--EXCLAMATION',
  '/': '__--FORWARDSLASH',
  '`': '__--GRAVE',
  '½': '__--HALF',
  'µ': '__--MU',
  '#': '__--OCTOTHORP',
  '<': '__--OPENANGLEBRACKET',
  '{': '__--OPENCURLYBRACE',
  '(': '__--OPENPAREN',
  '[': '__--OPENSQUAREBRACKET',
  '¶': '__--PARAGRAPH',
  '%': '__--PERCENT',
  '|': '__--PIPE',
  '+': '__--PLUS',
  '±': '__--PLUSMINUS',
  '£': '__--POUNDSTERLING',
  '¼': '__--QUARTER',
  '?': '__--QUESTIONMARK',
  '®': '__--REGISTERED',
  ';': '__--SEMICOLON',
  '\'': '__--SINGLEQUOTE',
  '¾': '__--THREEQUARTERS',
  '~': '__--TILDE',
  '¥': '__--YENYUAN',
  ' ': '_____-'
};

/**
 * Takes in a single character string. If it is part of the normal ASCII set, does nothing,
 * otherwise returns '__--U' and the charCode
 *
 * @param  {string} character  A single character string
 * @return {string}            The original ASCII char or '__--U' + charCode
 */
function unicodeEndocing (character) {
  let code = character.charCodeAt();
  // 33 = !, 48 = 0, 65 = A, 97 = a, 126 = ~
  if (code < 33 || code > 126) {
    return '__--U' + code;
  }
}

const prefix = 'rp__';

/**
 * Encodes propter/value pairs as valid, decodable classnames.
 *
 * @param  {object} declaration  Contains the Property and Value strings
 * @return {string}              A classname starting with . and a prefix
 */
function encodeClassName (declaration) {
  let newName = declaration.property + ':' + declaration.value;
  let nameArray = newName.split('');
  let encoded = nameArray.map(function (character) {
    return (
      propertyValueEncodingMap[character] ||
      unicodeEndocing(character) ||
      character
    );
  });
  return '.' + prefix + encoded.join('');
}

module.exports = encodeClassName;
