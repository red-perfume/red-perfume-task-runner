'use strict';

/**
 * @file    Validate and default the options object per documented API and log warnings.
 * @author  TheJaredWilcurt
 */

const helpers = require('./helpers.js');

/**
 * This is each of the hook names for each section
 * as documented in the API.
 *
 * @type {object}
 */
const allDocumentedHooks = {
  global: [
    'beforeValidation',
    'afterValidation',
    'beforeTasks',
    'afterTasks'
  ],
  task: [
    'beforeTask',
    'afterTask'
  ],
  styles: [
    'beforeRead',
    'afterRead',
    'afterProcessed',
    'afterOutput'
  ],
  markup: [
    'beforeRead',
    'afterRead',
    'afterProcessed',
    'afterOutput'
  ],
  scripts: [
    'beforeOutput',
    'afterOutput'
  ]
};

const validator = {
  /**
   * Validates if a value is an array.
   *
   * @param  {object} options  User's options
   * @param  {Array}  key      The value that should be an array
   * @param  {string} message  The message to log if not an array
   * @return {Array}           The array or undefined
   */
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
  /**
   * Validates and defaults would-be booleans.
   *
   * @param  {boolean} key    Value to validate
   * @param  {boolean} value  Default value to use if not a boolean
   * @return {boolean}        The value or default
   */
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
  /**
   * Validates a value is an object.
   *
   * @param  {object} options  User's options
   * @param  {object} key      The value that should be a object
   * @param  {string} message  The message to log if not an object
   * @return {object}          The object or undefined
   */
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
  /**
   * Validates a value is a string.
   *
   * @param  {object} options  User's options
   * @param  {string} key      Value that should be a string
   * @param  {string} message  The message to log if not a string
   * @return {string}          The string or undefined
   */
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

  /**
   * Validates optional customLogger is a function.
   *
   * @param  {object} options  User's options
   * @return {object}          Modified user's options
   */
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
      options.tasks = options.tasks.map((task, taskIndex) => {
        return this.validateTask(options, task, taskIndex);
      }).filter(Boolean);

      if (!options.tasks.length) {
        helpers.throwError(options, 'No valid tasks found.');
      }
    }

    return options;
  },
  /**
   * Validates or removes the top level parts of a task.
   *
   * @param  {object} options    User's options
   * @param  {object} task       A Red Perfume task to be validated
   * @param  {number} taskIndex  The index of the current task
   * @return {object}            validated task
   */
  validateTask: function (options, task, taskIndex) {
    taskIndex = taskIndex || 0;
    task.uglify = this.validateBoolean(task.uglify, false);
    task.styles = this.validateObject(options, task.styles, 'Optional task.styles must be a type of object or be undefined.');
    task.markup = this.validateArray(options, task.markup, 'Optional task.markup must be an array or be undefined.');
    task.scripts = this.validateObject(options, task.scripts, 'Optional task.scripts must be a type of object or be undefined.');
    task.hooks = this.validateObject(options, task.hooks, 'Optional task.hooks must be a type of object or be undefined.');
    task.hooks = this.validateHookTypes(options, allDocumentedHooks.task, task.hooks, 'task.hooks.');

    if (task.styles) {
      task.styles = this.validateTaskStyles(options, task, taskIndex);
    }
    if (task.markup) {
      task.markup = this.validateTaskMarkup(options, task, taskIndex);
    }
    if (task.scripts) {
      task.scripts = this.validateTaskScripts(options, task, taskIndex);
    }

    ['styles', 'markup', 'scripts'].forEach(function (setting) {
      if (!task[setting]) {
        delete task[setting];
      }
    });
    if (
      !task.styles &&
      !task.markup &&
      !task.scripts &&
      !Object.keys(task.hooks).length
    ) {
      helpers.throwError(options, 'Tasks[' + taskIndex + '] does not contain styles, markup, scripts, or callback hooks.');
      delete task.hooks;
    }

    if (JSON.stringify(Object.keys(task)) === '["uglify"]') {
      task = undefined;
    }

    return task;
  },
  /**
   * Validates the values on styles task (in/out/data/hooks).
   *
   * @param  {object} options    User's options
   * @param  {object} task       The current task
   * @param  {number} taskIndex  The index of the current task
   * @return {object}            Validated task.styles or undefined
   */
  validateTaskStyles: function (options, task, taskIndex) {
    task = task || {};
    task.hooks = task.hooks || {};
    taskIndex = taskIndex || 0;
    let styles = task.styles || {};
    styles.in = this.validateTaskStylesIn(options, styles.in);
    styles.out = this.validateFile(options, styles.out, ['.css'], false);
    styles.data = this.validateString(options, styles.data, 'Optional task.styles.data must be a string of CSS or undefined.');
    styles.hooks = this.validateObject(options, styles.hooks, 'Optional task.styles.hooks must be an object or undefined.');
    styles.hooks = this.validateHookTypes(options, allDocumentedHooks.styles, styles.hooks, 'task.styles.hooks.');

    ['in', 'out', 'data'].forEach(function (setting) {
      if (!styles[setting]) {
        delete styles[setting];
      }
    });

    if (!styles.in && !styles.data) {
      helpers.throwError(options, 'Tasks[' + taskIndex + '] did not contain a task.styles.in or a task.style.data');
    }
    if (
      !styles.out &&
      !Object.keys(styles.hooks).length &&
      !task.hooks.afterTask
    ) {
      helpers.throwError(options, [
        'Tasks[' + taskIndex + '] did not contain',
        'a task.styles.out,',
        'a task.style.hooks callback,',
        'or a task.hooks.afterTask callback.'
      ].join(' '));
    }
    if (
      !styles.in &&
      !styles.out &&
      !styles.data &&
      !Object.keys(styles.hooks).length
    ) {
      delete styles.hooks;
    }
    if (!Object.keys(styles).length) {
      styles = undefined;
    }
    return styles;
  },
  /**
   * Validates task.styles.in.
   *
   * @param  {object} options   User's options
   * @param  {Array}  stylesIn  The array of file paths
   * @return {Array}            The array or undefined
   */
  validateTaskStylesIn: function (options, stylesIn) {
    stylesIn = this.validateArray(options, stylesIn, 'Optional task.styles.in must be an array or undefined.');
    if (stylesIn) {
      stylesIn = stylesIn.map((file) => {
        return this.validateFile(options, file, ['.css'], true);
      }).filter(Boolean);
    }
    return stylesIn;
  },
  /**
   * Validates the markup task.
   *
   * @param  {object} options    User's options
   * @param  {object} task       The current task
   * @param  {number} taskIndex  The index of the current task
   * @return {Array}             The validated task.markup array or undefined
   */
  validateTaskMarkup: function (options, task, taskIndex) {
    task = task || {};
    task.hooks = task.hooks || {};
    taskIndex = taskIndex || 0;
    let markup = task.markup || [];
    markup = markup.map((subTask, subTaskIndex) => {
      subTask.in = this.validateFile(options, subTask.in, ['.html', '.htm'], true);
      subTask.out = this.validateFile(options, subTask.out, ['.html', '.htm'], false);
      subTask.data = this.validateTaskMarkupData(options, subTask.data, taskIndex, subTaskIndex);
      subTask.hooks = this.validateObject(options, subTask.hooks, 'Optional task.markup.hooks must be an object or undefined.');
      subTask.hooks = this.validateHookTypes(options, allDocumentedHooks.markup, subTask.hooks, 'task.markup[subTask].hooks.');

      ['in', 'data', 'out'].forEach(function (setting) {
        if (!subTask[setting]) {
          delete subTask[setting];
        }
      });

      if (!subTask.in && !subTask.data) {
        helpers.throwError(options, 'Tasks[' + taskIndex + '] did not contain a task.markup[' + subTaskIndex + '].in or a task.markup[' + subTaskIndex + '].data');
      }
      if (
        !subTask.out &&
        !Object.keys(subTask.hooks).length &&
        !task.hooks.afterTask
      ) {
        helpers.throwError(options, [
          'Tasks[' + taskIndex + '] did not contain',
          'a task.markup[' + subTaskIndex + '].out,',
          'a task.markup[' + subTaskIndex + '].hooks callback,',
          'or a task.hooks.afterTask callback.'
        ].join(' '));
      }
      if (!subTask.in && !subTask.data && !subTask.out && !Object.keys(subTask.hooks).length) {
        delete subTask.hooks;
      }

      if (!Object.keys(subTask).length) {
        subTask = undefined;
      }
      return subTask;
    }).filter(Boolean);

    if (!markup.length) {
      markup = undefined;
    }

    return markup;
  },
  /**
   * Validates the task.markup.data is a string of HTML.
   *
   * @param  {object} options       User's options
   * @param  {string} data          The markup string to validate
   * @param  {number} taskIndex     The index of the current task
   * @param  {number} subTaskIndex  The index of the current markdown subTask
   * @return {string}               The valid string or undefined
   */
  validateTaskMarkupData: function (options, data, taskIndex, subTaskIndex) {
    taskIndex = taskIndex || 0;
    subTaskIndex = subTaskIndex || 0;
    let message = 'Optional tasks[' + taskIndex + '].markup[' + subTaskIndex + '].data must be a string that begins with \'<\' or undefined.';
    data = this.validateString(options, data, message);
    if (data && !data.trim().startsWith('<')) {
      data = undefined;
      helpers.throwError(options, message);
    }
    return data;
  },
  /**
   * Validates the task.scripts options.
   *
   * @param  {object} options    User's options
   * @param  {object} task       The current task
   * @param  {number} taskIndex  The index of the current task
   * @return {object}            Validated task.scripts or undefined
   */
  validateTaskScripts: function (options, task, taskIndex) {
    let scripts = task.scripts || {};
    scripts.out = this.validateString(options, scripts.out, 'Optional task.scripts.out must be a string or undefined.');
    scripts.hooks = this.validateObject(options, scripts.hooks, 'Optional task.scripts.hooks must be an object or undefined.');
    scripts.hooks = this.validateHookTypes(options, allDocumentedHooks.scripts, scripts.hooks, 'task.scripts.hooks.');

    if (!scripts.out) {
      delete scripts.out;
    }

    if (
      !scripts.out &&
      !Object.keys(scripts.hooks).length &&
      !task.hooks.afterTask
    ) {
      helpers.throwError(options, 'Tasks[' + taskIndex + '] did not contain a task.scripts.out, a task.scripts.hooks callback, or a task.hooks.afterTask callback.');
    }
    if (!scripts.out && !Object.keys(scripts.hooks).length) {
      delete scripts.hooks;
    }
    if (!Object.keys(scripts).length) {
      scripts = undefined;
    }
    return scripts;
  },
  /**
   * Generically validates all hook types as a
   * being a function, or deletes them.
   *
   * @param  {object} options          The user's options
   * @param  {Array}  documentedHooks  Array of strings of hook names as documented in the API
   * @param  {object} hooksContainer   The object that contains a key of "hooks" (like a subtask)
   * @param  {string} location         The location of where the hooks are (for a helper message)
   * @return {object}                  The validated hooks container
   */
  validateHookTypes: function (options, documentedHooks, hooksContainer, location) {
    hooksContainer = hooksContainer || {};
    documentedHooks.forEach(function (hook) {
      const hookType = typeof(hooksContainer[hook]);
      const allowedTypes = ['function', 'undefined'];
      if (!allowedTypes.includes(hookType)) {
        helpers.throwError(options, 'The ' + location + hook + ' must be a function or undefined.');
        delete hooksContainer[hook];
      }
    });
    return hooksContainer;
  },

  /**
   * Validates and defaults all values in the options object,
   * including tasks.
   *
   * @param  {object} options  User's options
   * @return {object}          Modified user's options
   */
  validateOptions: function (options) {
    if (typeof(options) !== 'object' || Array.isArray(options)) {
      options = undefined;
    }
    options = options || {};
    options.verbose = this.validateBoolean(options.verbose, true);
    options = this.validateCustomLogger(options);
    options = this.validateTasks(options);
    options.hooks = this.validateHookTypes(options, allDocumentedHooks.global, options.hooks, 'global ');

    return options;
  }
};

module.exports = validator;
