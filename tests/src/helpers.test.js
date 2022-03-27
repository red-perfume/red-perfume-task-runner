'use strict';
/* eslint-disable max-lines-per-function */

/**
 * @file    Testing file
 * @author  TheJaredWilcurt
 */

const helpers = require('@/helpers.js');
const longMessage = [
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et',
  'dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex',
  'ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu',
  'fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt',
  'mollit anim id est laborum.'
];

describe('helpers', () => {
  describe('insertReturns', () => {
    test('Empty', () => {
      expect(helpers.insertReturns())
        .toEqual('');
    });

    test('Short message', () => {
      expect(helpers.insertReturns('Good job!'))
        .toEqual('Good job!');
    });

    test('Long message', () => {
      expect(helpers.insertReturns(longMessage.join(' ')))
        .toEqual(longMessage.join('\n'));
    });
  });

  describe('throwError', () => {
    let options;
    let consoleError;
    const output = [
      '_________________________',
      'Red-Perfume:',
      ...longMessage
    ].join('\n');

    beforeEach(() => {
      options = { verbose: true };
      consoleError = console.error;
      console.error = jest.fn();
    });

    afterEach(() => {
      console.error = consoleError;
      consoleError = undefined;
    });

    test('Empty object error', () => {
      helpers.throwError(options, longMessage.join(' '), {});

      expect(console.error)
        .toHaveBeenCalledWith(output, {});
    });

    test('Undefined error', () => {
      helpers.throwError(options, longMessage.join(' '));

      expect(console.error)
        .toHaveBeenCalledWith(output);
    });

    test('Skip throwing error when verbose false', () => {
      options.verbose = false;
      options.customLogger = jest.fn();
      helpers.throwError(options, longMessage.join(' '));

      expect(console.error)
        .not.toHaveBeenCalled();

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });
  });
});
