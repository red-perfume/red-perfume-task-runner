'use strict';

/**
 * @file    Parses CSS to an AST
 * @author  TheJaredWilcurt
 */

const css = require('css');
const selectorParse = require('css-what').parse;

const helpers = require('./helpers.js');

/**
 * Recursively remove position. Parsed CSS contains position
 * data that is not of use for us and just clouds up the console
 * logs during development.
 *
 * @param {any} item  Parsed CSS or a portion of it
 */
function recursivelyRemovePosition (item) {
  if (Array.isArray(item)) {
    item.forEach(function (subItem) {
      recursivelyRemovePosition(subItem);
    });
  }
  if (item && typeof(item) === 'object' && !Array.isArray(item)) {
    if (item.hasOwnProperty('position')) {
      delete item.position;
    }
    Object.keys(item).forEach(function (key) {
      recursivelyRemovePosition(item[key]);
    });
  }
}

/**
 * Parses the provided CSS string to an Abstract
 * Syntax Tree (AST). Adds an "original" value to
 * selectors on rules.
 *
 * @example
 * try {
 *   parsed = cssParser(options, input);
 * } catch {}
 *
 * @param  {object} options      User's options
 * @param  {string} input        The CSS string to be atomized
 * @param  {Array}  styleErrors  Array of style related errors
 * @return {object}              A parsed CSS AST
 */
const cssParser = function (options, input, styleErrors) {
  if (!input) {
    const message = 'Invalid CSS input.';
    styleErrors.push(message);
    helpers.throwError(options, message);
    return;
  }

  const parseOptions = {
    silent: !options.verbose,
    source: undefined
  };
  const parsed = css.parse(input, parseOptions);

  /*
    input = '.test { color: #F00 }';
    parsed = {
      type: 'stylesheet',
      stylesheet: {
        rules: [
          {
            type: 'rule',
            selectors: [
              [
                {
                  action: 'element',
                  ignoreCase: false,
                  name: 'class',
                  namespace: null,
                  original: '.test',
                  type: 'attribute',
                  value: 'test'
                }
              ]
            ],
            declarations: [
              {
                position: {...},
                property: 'color',
                type: 'declaration',
                value: '#F00'
              }
            ],
            position: {...}
          }
        ],
        source: undefined,
        parsingErrors: []
      }
    }
   */
  if (parsed && parsed.stylesheet && parsed.stylesheet.rules) {
    // TODO: This line is only used to make console logs cleaner, can be commented out in the future for a performance boost
    recursivelyRemovePosition(parsed.stylesheet.rules);
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
