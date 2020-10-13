// This is a quick and naive approach. Needs to be improved and dynamically handle all unicode
// Initially I thought this too verbose, but there is literally no limit on class lengths other than the machine's memory/CPU.
// Firefox actually let me create and reference a classname with 100,000,000 characters. It was slow, but it worked fine.
const propertyValueEncodingMap = {
  '&': '__--AMPERSAND',
  '*': '__--ASTERISK',
  '@': '__--ATSIGN',
  '\\': '__--BACKSLASH',
  '^': '__--CARET',
  '>': '__--CLOSEANGLEBRACKET',
  '}': '__--CLOSECURLYBRACE',
  ')': '__--CLOSEPAREN',
  ']': '__--CLOSESQUAREBRACKET',
  ':': '__--COLON',
  ',': '__--COMMA',
  '$': '__--DOLARSIGN',
  '.': '__--DOT',
  '"': '__--DOUBLEQUOTE',
  '=': '__--EQUAL',
  '!': '__--EXCLAMATION',
  '/': '__--FORWARDSLASH',
  '#': '__--OCTOTHORP',
  '<': '__--OPENANGLEBRACKET',
  '{': '__--OPENCURLYBRACE',
  '(': '__--OPENPAREN',
  '[': '__--OPENSQUAREBRACKET',
  '%': '__--PERCENT',
  '|': '__--PIPE',
  '+': '__--PLUS',
  '?': '__--QUESTIONMARK',
  ';': '__--SEMICOLON',
  '\'': '__--SINGLEQUOTE',
  ' ': '_____-'
};

const prefix = 'rp__';

function encodeClassName (declaration) {
  let newName = declaration.property + ':' + declaration.value;
  let nameArray = newName.split('');
  let encoded = nameArray.map(function (character) {
    return propertyValueEncodingMap[character] || character;
  });
  return '.' + prefix + encoded.join('');
}

module.exports = encodeClassName;
