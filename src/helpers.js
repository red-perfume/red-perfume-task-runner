const helpers = {
  /**
   * @param  options
   * @param  message
   * @param  error
   * @example
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
