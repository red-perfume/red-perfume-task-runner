'use strict';

/**
 * @file    The core functionality of the library.
 * @author  TheJaredWilcurt
 */

const validator = require('./src/validator.js');
const processTasks = require('./src/process-tasks.js');

/**
 * Verifies a hook exists and then runs it.
 *
 * @param {object} options  The user's options object
 * @param {string} hook     The hook to run
 */
function runHook (options, hook) {
  if (
    options &&
    options.hooks &&
    options.hooks[hook] &&
    typeof(options.hooks[hook]) === 'function'
  ) {
    options.hooks[hook](options);
  }
}

const redPerfume = {
  /**
   * Exposes the internal validate function. Validates that
   * the options object meets the expectations of the API as
   * documented. Provides helpful warning messages and
   * defaults values in the API, preparing the object for
   * use by Red Perfume.
   *
   * @example
   * redPerfume.validate({});
   *
   * @param  {object} options  User's options
   * @return {object}          Modifed version of user's options
   */
  validate: function (options) {
    return validator.validateOptions(options);
  },
  /**
   * Atomizes CSS. Updates Markup to replace classes with
   * atomized versions. Outputs CSS/HTML/JSON of atomized
   * styles/markup.
   *
   * @example
   * redPerfume.atomize({ tasks: [] });
   *
   * @param {object} options  User's options
   */
  atomize: function (options) {
    runHook(options, 'beforeValidation');
    options = this.validate(options);
    runHook(options, 'afterValidation');

    runHook(options, 'beforeTasks');
    processTasks(options);
    runHook(options, 'afterTasks');
  }
};

module.exports = redPerfume;
