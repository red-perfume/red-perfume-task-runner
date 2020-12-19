const validator = require('./src/validator.js');
const css = require('./src/css.js');
const html = require('./src/html.js');

const redPerfume = {
  validate: function (options) {
    return validator.validateOptions(options);
  },
  atomize: function (options) {
    options = this.validate(options);
    options.tasks.forEach((task) => {
      let processedStyles = {};
      if (task.styles) {
        if (task.styles.data) {
          processedStyles = css(options, task.styles.data);
        }
        if (task.styles.result) {
          task.styles.result(processedStyles.output, undefined);
        }
      }
      if (task.markup) {
        task.markup.forEach((item) => {
          let processedMarkup;
          if (item.data) {
            processedMarkup = html(item.data, processedStyles.classMap);
          }
          if (item.result) {
            item.result(processedMarkup, undefined);
          }
        });
      }
      if (task.scripts && task.scripts.result) {
        task.scripts.result(processedStyles.classMap, undefined);
      }
    });
  }
};

module.exports = redPerfume;
