const helpers = require('./helpers.js');

const validation = {
  validateOptions: function (options) {
    if (typeof(options) !== 'object' || Array.isArray(options)) {
      options = undefined;
    }
    options = options || {};

    if (typeof(options.verbose) !== 'boolean') {
      options.verbose = true;
    }

    if (!options.customLogger) {
      delete options.customLogger;
    } else if (typeof(options.customLogger) !== 'function') {
      delete options.customLogger;
      helpers.throwError(options, 'Optional customLogger must be a type of function.');
    }

    return options;
  }
};

module.exports = validation;
