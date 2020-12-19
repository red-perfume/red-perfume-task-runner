const helpers = require('./helpers.js');

const validation = {
  validateArray: function (options, key, message) {
    if (key && !Array.isArray(key)) {
      key = undefined;
      helpers.throwError(options, message);
    }
    return key;
  },
  validateBoolean: function (key, value) {
    if (typeof(key) !== 'boolean') {
      key = value;
    }
    return key;
  },
  validateFile: function (options, key, extension) {
    this.validateString(options, key, 'File paths must be a string');
    if (key && !key.endsWith(extension)) {
      helpers.throwError(options, 'Expected filepath to end in ' + extension);
      key = undefined;
    }
    if (key) {
      let fs = require('fs');
      if (!fs.existsSync(key)) {
        key = undefined;
        helpers.throwError(options, 'Could not find file: ' + key);
      }
    }
    return key;
  },
  validateFunction: function (options, key, message) {
    if (key && typeof(key) !== 'function') {
      key = undefined;
      helpers.throwError(options, message);
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
    return key;
  },
  validateString: function (options, key, message) {
    if (key === '' || (key && typeof(key) !== 'string')) {
      key = undefined;
      helpers.throwError(options, message);
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
  validateTasks: function (options) {
    if (
      !options.tasks ||
      !Array.isArray(options.tasks) ||
      !options.tasks.length
    ) {
      options.tasks = [];
      helpers.throwError(options, 'options.tasks Must be an array of objects. See documentation for details.');
    }

    options.tasks.forEach((task) => {
      this.validateTask(options, task);
    });

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
      this.validateTaskStyles(options, task.styles);
    }
    if (task.markup) {
      this.validateTaskMarkup(options, task.markup);
    }
    if (task.scripts) {
      this.validateTaskScripts(options, task.scripts);
    }
  },
  validateTaskStyles: function (options, styles) {
    styles.in = this.validateTaskStylesIn(options, styles.in);
    styles.out = this.validateTaskStylesOut(options, styles.out);
    styles.data = this.validateString(options, styles.data, 'Optional task.styles.data must be a string of CSS or undefined.');
    styles.result = this.validateFunction(options, styles.result, 'Optional task.styles.result must be a function or undefined.');

    if (!styles.in && !styles.data) {
      helpers.throwError(options, 'Task did not contain a task.styles.in or a task.style.data');
    }
    if (!styles.out && !styles.result) {
      helpers.throwError(options, 'Task did not contain a task.styles.out or a task.style.result');
    }
  },
  validateTaskStylesIn: function (options, stylesIn) {
    stylesIn = this.validateArray(options, stylesIn, 'Optional task.styles.in must be an array or undefined.');
    if (stylesIn) {
      stylesIn = stylesIn.map((file) => {
        return this.validateFile(options, file, '.css');
      }).filter(Boolean);
    }
    return stylesIn;
  },
  validateTaskStylesOut: function (options, stylesOut) {
    let message = 'Optional task.styles.out must be a string that ends with .css or undefined.';
    stylesOut = this.validateString(options, stylesOut, message);
    if (stylesOut && !stylesOut.endsWith('.css')) {
      stylesOut = undefined;
      helpers.throwError(options, message);
    }
    return stylesOut;
  },
  validateTaskMarkup: function (options, markup) {
    markup.forEach((item) => {
      item.in = this.validateObject(options, item.in, 'Optional task.markup.in must be an object or undefined.');
    });
  },
  validateTaskScripts: function (options, scripts) {
    scripts.out = this.validateString(options, scripts.out, 'Optional task.scripts.out must be a string or undefined.');
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

module.exports = validation;
