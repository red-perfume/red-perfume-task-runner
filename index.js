const fs = require('fs');
const validator = require('./src/validator.js');
const css = require('./src/css.js');
const html = require('./src/html.js');
const helpers = require('./src/helpers.js');

const redPerfume = {
  validate: function (options) {
    return validator.validateOptions(options);
  },
  getCssString: function (options, taskStyles) {
    let cssString = '';
    let styleErrors = [];

    if (taskStyles.in) {
      taskStyles.in.forEach((file) => {
        try {
          cssString = cssString + String(fs.readFileSync(file));
        } catch (err) {
          helpers.throwError(options, 'Error reading style file: ' + file, err);
          styleErrors.push(err);
        }
      });
    }
    if (taskStyles.data) {
      cssString = cssString + taskStyles.data;
    }

    return { cssString, styleErrors };
  },
  getHtmlString: function (options, item) {
    let markupString = '';
    let markupErrors = [];
    if (item.in) {
      try {
        markupString = markupString + String(fs.readFileSync(item.in));
      } catch (err) {
        helpers.throwError(options, 'Error reading markup file: ' + item.in, err);
        markupErrors.push(err);
      }
    }
    if (item.data) {
      markupString = markupString + item.data;
    }
    return { markupString, markupErrors };
  },
  outputAtomizedCSS: function (options, taskStyles, processedStyles, styleErrors) {
    if (taskStyles.out) {
      try {
        fs.writeFileSync(taskStyles.out, processedStyles.output + '\n');
      } catch (err) {
        helpers.throwError(options, 'Error writing CSS file: ' + taskStyles.out, err);
        styleErrors.push(err);
      }
    }
    if (taskStyles.result) {
      if (!styleErrors.length) {
        styleErrors = undefined;
      }
      taskStyles.result(processedStyles.output, styleErrors);
    }
  },
  outputAtomizedHTML: function (options, item, processedMarkup, markupErrors) {
    if (item.out) {
      try {
        fs.writeFileSync(item.out, processedMarkup + '\n');
      } catch (err) {
        helpers.throwError(options, 'Error writing markup file: ' + item.out, err);
        markupErrors.push(err);
      }
    }
    if (item.result) {
      if (!markupErrors.length) {
        markupErrors = undefined;
      }
      item.result(processedMarkup, markupErrors);
    }
  },
  outputAtomizedJSON: function (options, taskScripts, processedStyles) {
    let scriptErrors;
    if (taskScripts.out) {
      try {
        fs.writeFileSync(taskScripts.out, JSON.stringify(processedStyles.classMap, null, 2) + '\n');
      } catch (scriptErr) {
        helpers.throwError(options, 'Error writing script file: ' + taskScripts.out, scriptErr);
        scriptErrors = scriptErr;
      }
    }
    if (taskScripts.result) {
      taskScripts.result(processedStyles.classMap, scriptErrors);
    }
  },
  atomize: function (options) {
    options = this.validate(options);
    options.tasks.forEach((task) => {
      let processedStyles = {};

      if (task.styles) {
        const cssData = this.getCssString(options, task.styles);

        const hasStyleFiles = task.styles.in && task.styles.in.length;
        if (hasStyleFiles || task.styles.data) {
          processedStyles = css(options, cssData.cssString, task.uglify);
        }

        this.outputAtomizedCSS(options, task.styles, processedStyles, cssData.styleErrors);
      }

      if (task.markup) {
        task.markup.forEach((item) => {
          const htmlData = this.getHtmlString(options, item);

          let processedMarkup = '';
          if (item.in || item.data) {
            processedMarkup = html(options, htmlData.markupString, processedStyles.classMap);
          }

          this.outputAtomizedHTML(options, item, processedMarkup, htmlData.markupErrors);
        });
      }

      if (task.scripts) {
        this.outputAtomizedJSON(options, task.scripts, processedStyles);
      }
    });
  }
};

module.exports = redPerfume;
