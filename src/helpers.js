'use strict';

/**
 * @file    Shared helper functions used in multiple files
 * @author  TheJaredWilcurt
 */

const helpers = {
  /**
   * Finds and removes every instance of a value from an array.
   *
   * @param  {Array} arr    Any array
   * @param  {any}   value  Any literal that can be compared with ===
   * @return {Array}        The mutated array
   */
  removeEveryInstance: function (arr, value) {
    let i = 0;
    while (i < arr.length) {
      if (arr[i] === value) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return arr;
  },
  /**
   * Either calls the customLogger or does
   * console.error when errors/warnings happen
   * during validation or execution.
   *
   * @param {object} options  User's options on verbose and custom logging
   * @param {string} message  Human readable warning/error
   * @param {any}    error    Caught error object
   */
  throwError: function (options, message, error) {
    if (options.verbose && options.customLogger) {
      options.customLogger(message, error);
    } else if (options.verbose) {
      console.error(
        '_________________________\n' +
        'Red-Perfume:\n' +
        message,
        error
      );
    }
  }
};

module.exports = helpers;
