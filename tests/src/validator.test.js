'use strict';
/* eslint-disable max-lines-per-function */

/**
 * @file    Testing file
 * @author  TheJaredWilcurt
 */

const mockfs = require('mock-fs');
const validator = require('@/validator.js');

const testHelpers = require('@@/testHelpers.js');

describe('Validator', () => {
  let options;

  beforeEach(() => {
    options = {
      verbose: true,
      customLogger: jest.fn()
    };
  });

  describe('validateArray', () => {
    test('Falsy', () => {
      expect(validator.validateArray(options, false, 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Non array', () => {
      expect(validator.validateArray(options, 'key', 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('message', undefined);
    });

    test('Array', () => {
      expect(validator.validateArray(options, ['key'], 'message'))
        .toEqual(['key']);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateBoolean', () => {
    test('undefined, true', () => {
      expect(validator.validateBoolean(undefined, true))
        .toEqual(true);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('undefined, false', () => {
      expect(validator.validateBoolean(undefined, false))
        .toEqual(false);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('falsy, true', () => {
      expect(validator.validateBoolean('', true))
        .toEqual(true);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('truthy, false', () => {
      expect(validator.validateBoolean('asdf', false))
        .toEqual(false);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('true, true', () => {
      expect(validator.validateBoolean(true, true))
        .toEqual(true);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('false, false', () => {
      expect(validator.validateBoolean(false, false))
        .toEqual(false);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('true, false', () => {
      expect(validator.validateBoolean(true, false))
        .toEqual(true);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('false, true', () => {
      expect(validator.validateBoolean(false, true))
        .toEqual(false);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateFile', () => {
    describe('extensions', () => {
      test('No extensions array', () => {
        expect(validator.validateFile(options, 'C:\\test', undefined, false))
          .toEqual('C:\\test');

        expect(options.customLogger)
          .not.toHaveBeenCalled();
      });

      test('No extension', () => {
        expect(validator.validateFile(options, 'C:\\test', [], false))
          .toEqual('C:\\test');

        expect(options.customLogger)
          .not.toHaveBeenCalled();
      });

      test('Does not contain extension', () => {
        expect(validator.validateFile(options, 'C:\\test', ['.fail'], false))
          .toEqual(undefined);

        expect(options.customLogger)
          .toHaveBeenCalledWith('Expected filepath (C:\\test) to end in .fail', undefined);
      });

      test('Does not contain either extension', () => {
        expect(validator.validateFile(options, 'C:\\test', ['.fail', '.notfound'], false))
          .toEqual(undefined);

        expect(options.customLogger)
          .toHaveBeenCalledWith('Expected filepath (C:\\test) to end in .fail or .notfound', undefined);
      });

      test('Does not contain any extensions', () => {
        expect(validator.validateFile(options, 'C:\\test', ['.fail', '.notfound', '.bad'], false))
          .toEqual(undefined);

        expect(options.customLogger)
          .toHaveBeenCalledWith('Expected filepath (C:\\test) to end in .fail, .notfound, or .bad', undefined);
      });

      test('Contains extension', () => {
        expect(validator.validateFile(options, 'C:\\test.sass', ['.css', '.scss', '.sass'], false))
          .toEqual('C:\\test.sass');

        expect(options.customLogger)
          .not.toHaveBeenCalled();
      });
    });

    describe('checkIfExists', () => {
      afterEach(() => {
        mockfs.restore();
      });

      test('File exists', () => {
        mockfs({
          'C:\\test\\file.css': '.text { background: #F00; }'
        });

        expect(validator.validateFile(options, 'C:\\test\\file.css', ['.css', '.scss', '.sass'], true))
          .toEqual('C:\\test\\file.css');

        expect(options.customLogger)
          .not.toHaveBeenCalled();
      });

      test('File does not exist', () => {
        mockfs({
          'C:\\test\\file.txt': 'text'
        });

        expect(validator.validateFile(options, 'C:\\test\\file.css', ['.css', '.scss', '.sass'], true))
          .toEqual(undefined);

        expect(options.customLogger)
          .toHaveBeenCalledWith('Could not find file: C:\\test\\file.css', undefined);
      });
    });
  });

  describe('validateObject', () => {
    test('Falsy', () => {
      expect(validator.validateObject(options, false, 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Non-object', () => {
      expect(validator.validateObject(options, 'key', 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('message', undefined);
    });

    test('Object', () => {
      const obj = {};

      expect(validator.validateObject(options, obj, 'message'))
        .toEqual(obj);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateString', () => {
    test('Falsy', () => {
      expect(validator.validateString(options, false, 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Non-string', () => {
      expect(validator.validateString(options, {}, 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('message', undefined);
    });

    test('String', () => {
      expect(validator.validateString(options, 'Test', 'message'))
        .toEqual('Test');

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateCustomLogger', () => {
    let consoleError;

    beforeEach(() => {
      consoleError = console.error;
      console.error = jest.fn();
    });

    afterEach(() => {
      console.error = consoleError;
      consoleError = undefined;
    });

    test('Falsy', () => {
      options.customLogger = false;

      expect(validator.validateCustomLogger(options).hasOwnProperty('customLogger'))
        .toEqual(false);

      expect(console.error)
        .not.toHaveBeenCalled();
    });

    test('Non-function', () => {
      options.customLogger = {};

      expect(validator.validateCustomLogger(options).hasOwnProperty('customLogger'))
        .toEqual(false);

      expect(console.error)
        .toHaveBeenCalledWith(testHelpers.trimIndentation(`
          _________________________
          Red-Perfume:
          Optional customLogger must be a type of function.
        `, 10));
    });

    test('Function', () => {
      expect(validator.validateCustomLogger(options).hasOwnProperty('customLogger'))
        .toEqual(true);

      expect(console.error)
        .not.toHaveBeenCalled();

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateTasks', () => {
    test('All tasks valid', () => {
      let hooks = { afterOutput: jest.fn() };
      options.tasks = [{
        styles: {
          data: '.a{margin:1px}',
          hooks
        }
      }];

      expect(validator.validateTasks(options))
        .toEqual({
          verbose: true,
          customLogger: options.customLogger,
          tasks: [{
            uglify: false,
            styles: {
              data: '.a{margin:1px}',
              hooks
            },
            hooks: {}
          }]
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateTask', () => {
    test('Empty object', () => {
      expect(validator.validateTask(options, {}))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] does not contain styles, markup, scripts, or callback hooks.', undefined);
    });

    test('Uglify true', () => {
      expect(validator.validateTask(options, { uglify: true }))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] does not contain styles, markup, scripts, or callback hooks.', undefined);
    });

    test('Styles, data, no hooks', () => {
      expect(validator.validateTask(options, { styles: { data: '.test { margin: 1px; }' } }))
        .toEqual({
          uglify: false,
          styles: {
            data: '.test { margin: 1px; }',
            hooks: {}
          },
          hooks: {}
        });

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] did not contain a task.styles.out, a task.style.hooks callback, or a task.hooks.afterTask callback.', undefined);
    });

    test('Styles, data, hooks', () => {
      let hooks = { afterOutput: jest.fn() };

      expect(validator.validateTask(options, { styles: { data: '.test { margin: 1px; }', hooks } }))
        .toEqual({
          uglify: false,
          styles: {
            data: '.test { margin: 1px; }',
            hooks
          },
          hooks: {}
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Styles, data, out', () => {
      expect(validator.validateTask(options, { styles: { data: '.test { margin: 1px; }', out: 'C:\\file.css' } }))
        .toEqual({
          uglify: false,
          styles: {
            data: '.test { margin: 1px; }',
            out: 'C:\\file.css',
            hooks: {}
          },
          hooks: {}
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Markup, data, hook', () => {
      let data = '<h1 class="test">Hi</h1>';
      let hooks = { afterOutput: jest.fn() };

      expect(validator.validateTask(options, { markup: [{ data, hooks }] }))
        .toEqual({
          uglify: false,
          markup: [{ data, hooks }],
          hooks: {}
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Each section is empty object', () => {
      expect(validator.validateTask(options, { styles: {}, markup: [], scripts: {} }))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] did not contain a task.styles.in or a task.style.data', undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] did not contain a task.styles.out, a task.style.hooks callback, or a task.hooks.afterTask callback.', undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] did not contain a task.scripts.out, a task.scripts.hooks callback, or a task.hooks.afterTask callback.', undefined);
    });

    test('Each section is valid', () => {
      const hooks = { afterOutput: jest.fn() };
      let task = {
        styles: {
          data: '.test { color: #F00; }',
          hooks
        },
        markup: [
          {
            data: '<div class="test">Hi</div>',
            hooks
          }
        ],
        scripts: { hooks }
      };

      expect(validator.validateTask(options, task))
        .toEqual({ uglify: false, ...task });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateTaskStyles', () => {
    test('Undefined task', () => {
      expect(validator.validateTaskStyles(options))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] did not contain a task.styles.in or a task.style.data', undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] did not contain a task.styles.out, a task.style.hooks callback, or a task.hooks.afterTask callback.', undefined);
    });

    test('Empty task object', () => {
      expect(validator.validateTaskStyles(options, {}))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] did not contain a task.styles.in or a task.style.data', undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] did not contain a task.styles.out, a task.style.hooks callback, or a task.hooks.afterTask callback.', undefined);
    });

    test('In and out', () => {
      mockfs({
        'C:\\app.css': '.app { background: #F00; }',
        'C:\\vendor.css': '.vendor { margin: 10px; }'
      });

      let styles = {
        in: [
          'C:\\app.css',
          'C:\\vendor.css'
        ],
        out: 'C:\\out.css'
      };

      expect(validator.validateTaskStyles(options, { styles }))
        .toEqual({ ...styles, hooks: {} });

      expect(options.customLogger)
        .not.toHaveBeenCalled();

      mockfs.restore();
    });
  });

  describe('validateTaskMarkup', () => {
    test('Undefined task', () => {
      expect(validator.validateTaskMarkup(options))
        .toEqual(undefined);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Empty array of subTasks', () => {
      expect(validator.validateTaskMarkup(options, { markup: [] }))
        .toEqual(undefined);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Empty subTask object', () => {
      expect(validator.validateTaskMarkup(options, { markup: [{}] }))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] did not contain a task.markup[0].in or a task.markup[0].data', undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] did not contain a task.markup[0].out, a task.markup[0].hooks callback, or a task.hooks.afterTask callback.', undefined);
    });

    test('In out', () => {
      mockfs({
        'C:\\in.html': '<h1 class="test">Hi</h1>'
      });

      let markup = [{
        in: 'C:\\in.html',
        out: 'C:\\out.html'
      }];

      expect(validator.validateTaskMarkup(options, { markup }))
        .toEqual(markup);

      expect(options.customLogger)
        .not.toHaveBeenCalled();

      mockfs.restore();
    });
  });

  describe('validateTaskMarkupData', () => {
    test('Invalid HTML', () => {
      expect(validator.validateTaskMarkupData(options, 'Hi'))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Optional tasks[0].markup[0].data must be a string that begins with \'<\' or undefined.', undefined);
    });

    test('Valid HTML', () => {
      let data = '<div class="test">Hi</div>';

      expect(validator.validateTaskMarkupData(options, data))
        .toEqual(data);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateTaskScripts', () => {
    test('Empty', () => {
      expect(validator.validateTaskScripts(options, undefined))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] did not contain a task.scripts.out, a task.scripts.hooks callback, or a task.hooks.afterTask callback.', undefined);
    });

    test('Empty object', () => {
      expect(validator.validateTaskScripts(options, {}))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] did not contain a task.scripts.out, a task.scripts.hooks callback, or a task.hooks.afterTask callback.', undefined);
    });

    test('Out', () => {
      mockfs({
        'C:\\file.json': 'Text'
      });

      expect(validator.validateTaskScripts(options, { scripts: { out: 'C:\\file.json' } }))
        .toEqual({
          out: 'C:\\file.json',
          hooks: {}
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();

      mockfs.restore();
    });
  });

  describe('validateHookTypes', () => {
    test('Empty', () => {
      expect(validator.validateHookTypes())
        .toEqual({});
    });

    test('Just options', () => {
      expect(validator.validateHookTypes(options))
        .toEqual({});

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Bad hooks', () => {
      expect(validator.validateHookTypes(options, ['potato'], { potato: 'potato' }, 'Test '))
        .toEqual({});

      expect(options.customLogger)
        .toHaveBeenCalledWith('The Test potato must be a function or undefined.', undefined);
    });

    test('Good hooks', () => {
      const hooksContainer = {
        afterOutput: jest.fn()
      };

      expect(validator.validateHookTypes(options, ['beforeOutput', 'afterOutput'], hooksContainer, 'Test '))
        .toEqual(hooksContainer);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });

  describe('validateOptions', () => {
    test('No options', () => {
      let consoleError = console.error;
      console.error = jest.fn();

      expect(validator.validateOptions([]))
        .toEqual({
          verbose: true,
          tasks: [],
          hooks: {}
        });

      expect(console.error)
        .toHaveBeenCalledWith(testHelpers.trimIndentation(`
          _________________________
          Red-Perfume:
          options.tasks Must be an array of objects. See documentation for details.
        `, 10));

      console.error = consoleError;
      consoleError = undefined;
    });

    test('No tasks', () => {
      expect(validator.validateOptions(options))
        .toEqual({
          verbose: true,
          customLogger: options.customLogger,
          tasks: [],
          hooks: {}
        });

      expect(options.customLogger)
        .toHaveBeenCalledWith('options.tasks Must be an array of objects. See documentation for details.', undefined);
    });

    test('Empty tasks array', () => {
      options.tasks = [];

      expect(validator.validateOptions(options))
        .toEqual({
          verbose: true,
          customLogger: options.customLogger,
          tasks: [],
          hooks: {}
        });

      expect(options.customLogger)
        .toHaveBeenCalledWith('options.tasks Must be an array of objects. See documentation for details.', undefined);
    });

    test('Tasks array empty object', () => {
      options.tasks = [{}];

      expect(validator.validateOptions(options))
        .toEqual({
          verbose: true,
          customLogger: options.customLogger,
          tasks: [],
          hooks: {}
        });

      expect(options.customLogger)
        .toHaveBeenCalledWith('Tasks[0] does not contain styles, markup, scripts, or callback hooks.', undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('No valid tasks found.', undefined);
    });
  });
});
