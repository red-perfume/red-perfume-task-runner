'use strict';
/* eslint-disable max-lines-per-function */

/**
 * @file    Testing file
 * @author  TheJaredWilcurt
 */

const processTasks = require('@/process-tasks.js');

describe('processTasks', () => {
  test('Empty', () => {
    expect(processTasks())
      .toEqual([]);
  });
});
