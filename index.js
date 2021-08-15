const validator = require('./src/validator.js');
const processTask = require('./src/process-task.js');

const redPerfume = {
  /**
   * @param  options
   * @example
   */
  validate: function (options) {
    return validator.validateOptions(options);
  },
  /**
   * @param  options
   * @example
   */
  atomize: function (options) {
    options = this.validate(options);
    options.tasks.forEach((task) => {
      processTask(options, task);
    });
  }
};

module.exports = redPerfume;
