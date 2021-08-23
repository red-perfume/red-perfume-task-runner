'use strict';

/**
 * @file    Encodes a CSS class name
 * @author  TheJaredWilcurt
 */

const helpers = require('./helpers.js');

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
 * otherwise returns '__--U' and the charCode.
 *
 * @example
 * unicodeEncoding('â'); // '__--U226'
 *
 * @param  {string} character  A single character string
 * @return {string}            The original ASCII char or '__--U' + charCode
 */
function unicodeEncoding (character) {
  let code = character.charCodeAt();
  // 33 = !, 48 = 0, 65 = A, 97 = a, 126 = ~
  if (code < 33 || code > 126) {
    return '__--U' + code;
  }
}

// TODO: Eventually this should be an option user's can provide.
const prefix = 'rp__';

/**
 * Encodes propter/value pairs as valid, decodable classnames.
 *
 * @example
 * let encodedClassName = encodeClassName(options, declaration);
 *
 * @param  {object} options      User's passed in options, containing verbose/customLoger
 * @param  {object} declaration  Contains the Property and Value strings
 * @param  {Array}  styleErrors  Array containing all style related errors
 * @return {string}              A classname starting with . and a prefix
 */
function encodeClassName (options, declaration, styleErrors) {
  if (!declaration || declaration.property === undefined || declaration.value === undefined) {
    let message = [
      'A rule declaration was missing details,',
      'such as property or value.',
      'This may result in a classname like',
      '.rp__width__--COLONundefined,',
      '.rp__undefined__--COLON100px,',
      'or',
      '.rp__undefined__--COLONundefined.',
      'If there are multiples of these,',
      'they may replace the previous.',
      'Please report this error to',
      'github.com/red-perfume/red-perfume/issues',
      'because I have no idea how to',
      'reproduce it with actual CSS input.',
      'This was just meant for a safety check.',
      'Honestly, if you actually got this',
      'error, I\'m kind of impressed.'
    ].join(' ');
    styleErrors.push(message);
    helpers.throwError(options, message);
  }
  declaration = declaration || {};
  let newName = declaration.property + ':' + declaration.value;
  let nameArray = newName.split('');
  let encoded = nameArray.map(function (character) {
    return (
      propertyValueEncodingMap[character] ||
      unicodeEncoding(character) ||
      character
    );
  });
  return '.' + prefix + encoded.join('');
}

// This is exported out too for a unit test
encodeClassName.propertyValueEncodingMap = propertyValueEncodingMap;
module.exports = encodeClassName;
