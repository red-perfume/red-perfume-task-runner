const validator = require('./src/validator.js');
const processTask = require('./src/process-task.js');

const redPerfume = {
  validate: function (options) {
    return validator.validateOptions(options);
  },
  atomize: function (options) {
    options = this.validate(options);
    options.tasks.forEach((task) => {
      processTask(options, task);
    });
  }
};

module.exports = redPerfume;
