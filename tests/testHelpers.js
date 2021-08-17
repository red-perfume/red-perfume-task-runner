'use strict';

/**
 * @file    Helper functions used by unit tests
 * @author  TheJaredWilcurt
 */

const testHelpers = {
  /**
   * The errno value from a failed fs read/write is a different
   * value on different OS's. Since we don't care about the type
   * of error (since we are force it to occur for the sake of the
   * test) we just remove it from the object, so each OS can
   * correctly validate and pass the test.
   *
   * @param  {Error}  err  An Error object, or an array of Error objects
   * @return {object}      Just a plain object, with errno removed
   */
  removeErrno: function (err) {
    err = JSON.parse(JSON.stringify(err));
    if (!err.errno && Array.isArray(err) && err.length && err[0].errno) {
      err = err[0];
    }
    delete err.errno;
    return err;
  },
  /**
   * Removes a set amount of spaces from the start of every line passed in.
   * Used to make test expectations more readable.
   *
   * @param  {string} value   The text to change
   * @param  {number} amount  How much indentation to remove from each line
   * @return {string}         The changed text
   */
  trimIndentation: function (value, amount) {
    value = value || '';
    amount = amount || 2;
    let output = [];

    let spaces = new Array(amount).fill(' ').join('');
    let lines = value.split('\n');
    lines.forEach(function (line) {
      if (line.trim() !== '') {
        output.push(line.replace(spaces, ''));
      }
    });

    value = output.join('\n');
    return value.trim();
  }
};

module.exports = testHelpers;
