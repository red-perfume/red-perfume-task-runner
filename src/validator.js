const helpers = require('./helpers.js');

const validator = {
  validateArray: function (options, key, message) {
    if (key && !Array.isArray(key)) {
      key = undefined;
      helpers.throwError(options, message);
    }
    if (!key) {
      key = undefined;
    }
    return key;
  },
  validateBoolean: function (key, value) {
    if (typeof(key) !== 'boolean') {
      key = value;
    }
    return key;
  },
  /**
   * Validates if a given value is a string, ending with one of the
   * allowed extensions, and that the file exists on the system.
   *
   * @param  {object}  options        The options object containing verbose and customLogger setting
   * @param  {string}  key            The value to validate, a string of a filepath
   * @param  {Array}   extensions     An array of strings for file extensions
   * @param  {boolean} checkIfExists  true = check for fs.existsSync(key)
   * @return {string}                 Returns a string or undefined if string was invalid
   */
  validateFile: function (options, key, extensions, checkIfExists) {
    key = this.validateString(options, key, 'File paths must be a string');
    extensions = this.validateArray(options, extensions, 'extensions argument must be an array of strings containing file extensions for validation');

    if (key && extensions && extensions.length) {
      let valid = extensions.some((extension) => {
        return key.endsWith(extension);
      });
      if (!valid) {
        let extensionsMessage;
        if (extensions.length === 1) {
          extensionsMessage = extensions[0];
        } else if (extensions.length === 2) {
          extensionsMessage = extensions[0] + ' or ' + extensions[1];
        } else {
          extensionsMessage = extensions.slice(0, -1).join(', ') + ', or ' + extensions.slice(-1);
        }
        helpers.throwError(options, 'Expected filepath (' + key + ') to end in ' + extensionsMessage);
        key = undefined;
      }
    }

    if (key && checkIfExists) {
      let fs = require('fs');
      if (!fs.existsSync(key)) {
        helpers.throwError(options, 'Could not find file: ' + key);
        key = undefined;
      }
    }

    return key;
  },
  validateFunction: function (options, key, message) {
    if (key && typeof(key) !== 'function') {
      key = undefined;
      helpers.throwError(options, message);
    }
    if (!key) {
      key = undefined;
    }
    return key;
  },
  validateObject: function (options, key, message) {
    if (
      key &&
      (
        typeof(key) !== 'object' ||
        Array.isArray(key)
      )
    ) {
      key = undefined;
      helpers.throwError(options, message);
    }
    if (!key) {
      key = undefined;
    }
    return key;
  },
  validateString: function (options, key, message) {
    if (key === '' || (key && typeof(key) !== 'string')) {
      key = undefined;
      helpers.throwError(options, message);
    }
    if (!key) {
      key = undefined;
    }
    return key;
  },

  validateCustomLogger: function (options) {
    if (!options.customLogger) {
      delete options.customLogger;
    } else if (typeof(options.customLogger) !== 'function') {
      delete options.customLogger;
      helpers.throwError(options, 'Optional customLogger must be a type of function.');
    }
    return options;
  },
  /**
   * Validates the array of tasks.
   *
   * @param  {object} options  The options object passed in by the user.
   * @return {object}          Returns an object that will always contain a valid or empty tasks array.
   */
  validateTasks: function (options) {
    if (
      !options.tasks ||
      !Array.isArray(options.tasks) ||
      !options.tasks.length
    ) {
      options.tasks = [];
      helpers.throwError(options, 'options.tasks Must be an array of objects. See documentation for details.');
    }

    if (options.tasks.length) {
      options.tasks = options.tasks.map((task) => {
        return this.validateTask(options, task);
      }).filter(Boolean);

      if (!options.tasks.length) {
        helpers.throwError(options, 'No valid tasks found.');
      }
    }

    return options;
  },
  validateTask: function (options, task) {
    task.uglify = this.validateBoolean(task.uglify, false);
    task.styles = this.validateObject(options, task.styles, 'Optional task.styles must be a type of object or be undefined.');
    task.markup = this.validateArray(options, task.markup, 'Optional task.markup must be an array or be undefined.');
    task.scripts = this.validateObject(options, task.scripts, 'Optional task.scripts must be a type of object or be undefined.');

    if (
      !task.styles &&
      !task.markup &&
      !task.scripts
    ) {
      helpers.throwError(options, 'Your task does not contain styles, markup, or scripts');
      return;
    }

    if (task.styles) {
      task.styles = this.validateTaskStyles(options, task.styles);
    }
    if (task.markup) {
      task.markup = this.validateTaskMarkup(options, task.markup);
    }
    if (task.scripts) {
      task.scripts = this.validateTaskScripts(options, task.scripts);
    }

    if (!task.styles) {
      delete task.styles;
    }
    if (!task.markup) {
      delete task.markup;
    }
    if (!task.scripts) {
      delete task.scripts;
    }

    return task;
  },
  validateTaskStyles: function (options, styles) {
    styles.in = this.validateTaskStylesIn(options, styles.in);
    styles.out = this.validateFile(options, styles.out, ['.css'], false);
    styles.data = this.validateString(options, styles.data, 'Optional task.styles.data must be a string of CSS or undefined.');
    styles.result = this.validateFunction(options, styles.result, 'Optional task.styles.result must be a function or undefined.');

    if (!styles.in) {
      delete styles.in;
    }
    if (!styles.out) {
      delete styles.out;
    }
    if (!styles.data) {
      delete styles.data;
    }
    if (!styles.result) {
      delete styles.result;
    }

    if (!styles.in && !styles.data) {
      helpers.throwError(options, 'Task did not contain a task.styles.in or a task.style.data');
    }
    if (!styles.out && !styles.result) {
      helpers.throwError(options, 'Task did not contain a task.styles.out or a task.style.result');
    }
    if (!Object.keys(styles).length) {
      styles = undefined;
    }
    return styles;
  },
  validateTaskStylesIn: function (options, stylesIn) {
    stylesIn = this.validateArray(options, stylesIn, 'Optional task.styles.in must be an array or undefined.');
    if (stylesIn) {
      stylesIn = stylesIn.map((file) => {
        return this.validateFile(options, file, ['.css'], true);
      }).filter(Boolean);
    }
    return stylesIn;
  },
  validateTaskMarkup: function (options, markup) {
    markup = markup.map((item) => {
      item.in = this.validateFile(options, item.in, ['.html', '.htm'], true);
      item.out = this.validateFile(options, item.out, ['.html', '.htm'], false);
      item.data = this.validateTaskMarkupData(options, item.data);
      item.result = this.validateFunction(options, item.result, 'Optional task.markup.result must be a function or undefined.');

      if (!item.in) {
        delete item.in;
      }
      if (!item.data) {
        delete item.data;
      }
      if (!item.out) {
        delete item.out;
      }
      if (!item.result) {
        delete item.result;
      }

      if (!item.in && !item.data) {
        helpers.throwError(options, 'Task did not contain a task.markup.in or a task.markup.data');
      }
      if (!item.out && !item.result) {
        helpers.throwError(options, 'Task did not contain a task.markup.out or a task.markup.result');
      }
      if (!Object.keys(item).length) {
        item = undefined;
      }
      return item;
    }).filter(Boolean);

    if (!markup.length) {
      markup = undefined;
    }

    return markup;
  },
  validateTaskMarkupData: function (options, data) {
    let message = 'Optional task.markup.data must be a string that begins with \'<\' or undefined.';
    data = this.validateString(options, data, message);
    if (data && !data.trim().startsWith('<')) {
      data = undefined;
      helpers.throwError(options, message);
    }
    return data;
  },
  validateTaskScripts: function (options, scripts) {
    scripts.out = this.validateString(options, scripts.out, 'Optional task.scripts.out must be a string or undefined.');
    scripts.result = this.validateFunction(options, scripts.result, 'Optional task.scripts.result must be a function or undefined.');
    if (!scripts.out) {
      delete scripts.out;
    }
    if (!scripts.result) {
      delete scripts.result;
    }
    if (!scripts.out && !scripts.result) {
      helpers.throwError(options, 'Task did not contain a task.scripts.out or a task.scripts.result');
    }
    if (!Object.keys(scripts).length) {
      scripts = undefined;
    }
    return scripts;
  },

  validateOptions: function (options) {
    if (typeof(options) !== 'object' || Array.isArray(options)) {
      options = undefined;
    }
    options = options || {};
    options.verbose = this.validateBoolean(options.verbose, true);
    options = this.validateCustomLogger(options);
    options = this.validateTasks(options);

    return options;
  }
};

module.exports = validator;
