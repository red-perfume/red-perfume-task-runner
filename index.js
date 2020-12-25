const fs = require('fs');
const validator = require('./src/validator.js');
const css = require('./src/css.js');
const html = require('./src/html.js');
const helpers = require('./src/helpers.js');

const redPerfume = {
  validate: function (options) {
    return validator.validateOptions(options);
  },
  atomize: function (options) {
    options = this.validate(options);
    options.tasks.forEach((task) => {
      let processedStyles = {};
      if (task.styles) {
        let styleData = '';
        let styleErrors = [];
        if (task.styles.in) {
          task.styles.in.forEach((file) => {
            try {
              styleData = styleData + String(fs.readFileSync(file));
            } catch (err) {
              helpers.throwError('Error reading style file: ' + file, err);
              styleErrors.push(err);
            }
          });
        }
        if (task.styles.data) {
          styleData = styleData + task.styles.data;
        }
        if (
          (task.styles.in && task.styles.in.length) ||
          task.styles.data
        ) {
          processedStyles = css(options, styleData, task.uglify);
        }
        if (task.styles.out) {
          try {
            fs.writeFileSync(task.styles.out, processedStyles.output);
          } catch (err) {
            helpers.throwError('Error writing CSS file: ' + task.styles.out, err);
            styleErrors.push(err);
          }
        }
        if (task.styles.result) {
          if (!styleErrors.length) {
            styleErrors = undefined;
          }
          task.styles.result(processedStyles.output, styleErrors);
        }
      }
      if (task.markup) {
        task.markup.forEach((item) => {
          let processedMarkup;
          let markupData = '';
          let markupErrors = [];

          if (item.in) {
            try {
              markupData = markupData + String(fs.readFileSync(item.in));
            } catch (err) {
              helpers.throwError('Error reading markup file: ' + item.in, err);
              markupErrors.push(err);
            }
          }
          if (item.data) {
            markupData = markupData + item.data;
          }
          if (item.in || item.data) {
            processedMarkup = html(options, markupData, processedStyles.classMap);
          }
          if (item.out) {
            try {
              fs.writeFileSync(item.out, processedMarkup);
            } catch (err) {
              helpers.throwError('Error writing markup file: ' + item.out, err);
              markupErrors.push(err);
            }
          }
          if (item.result) {
            if (!markupErrors.length) {
              markupErrors = undefined;
            }
            item.result(processedMarkup, markupErrors);
          }
        });
      }
      if (task.scripts) {
        let scriptErrors;
        if (task.scripts.out) {
          try {
            fs.writeFileSync(task.scripts.out, JSON.stringify(processedStyles.classMap, null, 2));
          } catch (scriptErr) {
            helpers.throwError('Error writing script file: ' + task.scripts.out, scriptErr);
            scriptErrors = scriptErr;
          }
        }
        if (task.scripts.result) {
          task.scripts.result(processedStyles.classMap, scriptErrors);
        }
      }
    });
  }
};

module.exports = redPerfume;
