'use strict';

/**
 * @file    The core functionality of the library.
 * @author  TheJaredWilcurt
 */

const validator = require('./src/validator.js');
const processTasks = require('./src/process-tasks.js');

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
    options = this.validate(options);
    processTasks(options);
  }
};

module.exports = redPerfume;
