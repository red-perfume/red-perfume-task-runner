'use strict';

/**
 * @file    Minifies given HTML/CSS/JSON
 * @author  TheJaredWilcurt
 */

const CleanCSS = require('clean-css');
const deasync = require('deasync');
const htmlMinifier = require('html-minifier-terser').minify;

const helpers = require('./helpers.js');
const minificationSettings = require('./minification-settings.js');

/**
 * Minifies the styles.
 *
 * @param  {object} options              User's options
 * @param  {string} atomizedCss          The atomized styles
 * @param  {object} minificationOptions  The Clean-CSS minification options or a boolean
 * @param  {Array}  styleErrors          Array to contain style related errors
 * @return {string}                      Atomized, maybe uglified, maybe minified styles
 */
function css (options, atomizedCss, minificationOptions, styleErrors) {
  const generatedMinificationOptions = minificationSettings.generateCssMinificationOptions(minificationOptions);
  const output = new CleanCSS(generatedMinificationOptions).minify(atomizedCss);
  if (
    output.errors &&
    Array.isArray(output.errors) &&
    output.errors.length
  ) {
    const message = 'There was an error minifyings CSS.';
    output.errors.forEach(function (err) {
      styleErrors.push(err);
      helpers.throwError(options, message, err);
    });
  }
  if (
    output &&
    output.styles &&
    typeof(output.styles) === 'string' &&
    output.styles.length
  ) {
    return output.styles;
  }
  return atomizedCss;
}

/**
 * Minifies a given markup string based on options.
 *
 * @param  {object} options              Options object from user containing verbose/customLogger
 * @param  {string} atomizedHtml         The string of HTML to minify
 * @param  {object} minificationOptions  Options for HTML-Minifier-Terser
 * @param  {Array}  markupErrors         Array of error messages
 * @return {string}                      Minified markup
 */
function html (options, atomizedHtml, minificationOptions, markupErrors) {
  const generatedMinificationOptions = minificationSettings.generateCssMinificationOptions(minificationOptions);
  let done = false;
  let output = atomizedHtml;

  htmlMinifier(atomizedHtml, generatedMinificationOptions)
    .then(function (result) {
      output = result;
    })
    .catch((err) => {
      const message = 'Error minifying HTML';
      markupErrors.push(message);
      helpers.throwError(options, message, err);
    })
    .finally(() => {
      done = true;
    });

  deasync.loopWhile(function () {
    return !done;
  });

  return output;
}

/**
 * Minifies JSON (not JS).
 *
 * @param  {object}  options       User's options
 * @param  {object}  input         A JSON object
 * @param  {boolean} minify        True = minify
 * @param  {Array}   scriptErrors  Array to contain script related errors
 * @return {string}                Stringified, maybe minified, JSON
 */
function json (options, input, minify, scriptErrors) {
  if (typeof(input) === 'object') {
    let indentation = 2;
    if (minify) {
      indentation = null;
    }
    try {
      input = JSON.stringify(input, null, indentation);
    } catch (err) {
      scriptErrors.push(err);
      helpers.throwError(options, 'Error stringifying JSON', err);
    }
  }
  return input;
}

module.exports = {
  css,
  html,
  json
};
