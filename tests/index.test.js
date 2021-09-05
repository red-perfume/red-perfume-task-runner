'use strict';
/* eslint-disable max-lines-per-function */

/**
 * @file    Testing file
 * @author  TheJaredWilcurt
 */

const mockfs = require('mock-fs');
const fs = require('fs');
const redPerfume = require('../index.js');

const testHelpers = require('@@/testHelpers.js');

describe('Red Perfume', () => {
  let options;

  beforeEach(() => {
    options = {
      verbose: true,
      customLogger: jest.fn()
    };
  });

  afterEach(() => {
    mockfs.restore();
  });

  describe('Atomize', () => {
    describe('Failures and invalid states', () => {
      test('Empty', () => {
        let consoleError = console.error;
        console.error = jest.fn();

        expect(redPerfume.atomize())
          .toEqual(undefined);

        expect(console.error)
          .toHaveBeenCalledWith(testHelpers.trimIndentation(`
            _________________________
            Red-Perfume:
            options.tasks Must be an array of objects. See documentation for details.
          `, 12));

        console.error = consoleError;
        consoleError = undefined;
      });

      test('Fails to read CSS file', () => {
        mockfs({
          'C:\\app.css': mockfs.file({
            content: 'Fail',
            mode: parseInt('0000', 8)
          })
        });

        options.tasks = [{
          uglify: true,
          styles: {
            in: [
              'C:\\app.css'
            ],
            hooks: {
              afterOutput: function (options, { task, inputCss, atomizedCss, classMap, styleErrors }) {
                expect(Object.keys(task))
                  .toEqual(['uglify', 'styles', 'hooks']);

                expect(inputCss)
                  .toEqual('');

                expect(atomizedCss)
                  .toEqual('');

                expect(classMap)
                  .toEqual({});

                expect(testHelpers.removeErrno(styleErrors))
                  .toEqual({
                    syscall: 'open',
                    code: 'EACCES',
                    path:'C:\\app.css'
                  });
              }
            }
          }
        }];

        redPerfume.atomize(options);

        expect(options.customLogger.mock.calls[0][0])
          .toEqual('Error reading style file: C:\\app.css');

        expect(testHelpers.removeErrno(options.customLogger.mock.calls[0][1]))
          .toEqual({
            code: 'EACCES',
            path: 'C:\\app.css',
            syscall: 'open'
          });

        expect(options.customLogger)
          .toHaveBeenCalledWith('Error parsing CSS', '');

        mockfs.restore();
      });

      test('Fails to write CSS file', () => {
        mockfs({
          'C:\\app.css': '.a{margin:0px;}',
          'C:\\out.css': mockfs.file({
            content: 'Fail',
            mode: parseInt('0000', 8)
          })
        });

        options.tasks = [{
          uglify: true,
          styles: {
            in: [
              'C:\\app.css'
            ],
            out: 'C:\\out.css',
            hooks: {
              afterOutput: function (options, { task, inputCss, atomizedCss, classMap, styleErrors }) {
                expect(Object.keys(task))
                  .toEqual(['uglify', 'styles', 'hooks']);

                expect(inputCss)
                  .toEqual('.a{margin:0px;}');

                expect(atomizedCss)
                  .toEqual(testHelpers.trimIndentation(`
                    .rp__0 {
                      margin: 0px;
                    }
                  `, 20));

                expect(classMap)
                  .toEqual({ '.a': ['.rp__0'] });

                expect(testHelpers.removeErrno(styleErrors))
                  .toEqual({
                    code: 'EACCES',
                    path: 'C:\\out.css',
                    syscall: 'open'
                  });
              }
            }
          }
        }];

        redPerfume.atomize(options);

        expect(options.customLogger.mock.calls[0][0])
          .toEqual('Error writing CSS file: C:\\out.css');

        expect(testHelpers.removeErrno(options.customLogger.mock.calls[0][1]))
          .toEqual({
            code: 'EACCES',
            path: 'C:\\out.css',
            syscall: 'open'
          });

        mockfs.restore();
      });

      test('Fails to read HTML file', () => {
        mockfs({
          'C:\\home.html': mockfs.file({
            content: 'Fail',
            mode: parseInt('0000', 8)
          })
        });

        options.tasks = [{
          uglify: true,
          markup: [
            {
              in: 'C:\\home.html',
              out: 'C:\\home.dist.html',
              hooks: {
                afterOutput: function (options, { task, subTask, classMap, inputHtml, atomizedHtml, markupErrors }) {
                  expect(Object.keys(task))
                    .toEqual(['uglify', 'markup', 'hooks']);

                  expect(Object.keys(subTask))
                    .toEqual(['in', 'out', 'hooks', 'minify']);

                  expect(classMap)
                    .toEqual(undefined);

                  expect(inputHtml)
                    .toEqual('');

                  expect(atomizedHtml)
                    .toEqual('<html><head></head><body></body></html>');

                  expect(testHelpers.removeErrno(markupErrors[0]))
                    .toEqual({
                      syscall: 'open',
                      code: 'EACCES',
                      path:'C:\\home.html'
                    });
                }
              }
            }
          ]
        }];

        redPerfume.atomize(options);

        expect(options.customLogger.mock.calls[0][0])
          .toEqual('Error reading markup file: C:\\home.html');

        expect(testHelpers.removeErrno(options.customLogger.mock.calls[0][1]))
          .toEqual({
            code: 'EACCES',
            path: 'C:\\home.html',
            syscall: 'open'
          });

        expect(options.customLogger)
          .toHaveBeenCalledWith('Error parsing HTML', '<html><head></head><body></body></html>');

        mockfs.restore();
      });

      test('Fails to write HTML file', () => {
        mockfs({
          'C:\\home.html': '<h1 class="a">Hi</h1>',
          'C:\\home.out.html': mockfs.file({
            content: 'Fail',
            mode: parseInt('0000', 8)
          })
        });

        options.tasks = [{
          uglify: true,
          markup: [
            {
              in: 'C:\\home.html',
              out: 'C:\\home.out.html',
              hooks: {
                afterOutput: function (options, { task, subTask, classMap, inputHtml, atomizedHtml, markupErrors }) {
                  expect(Object.keys(task))
                    .toEqual(['uglify', 'markup', 'hooks']);

                  expect(Object.keys(subTask))
                    .toEqual(['in', 'out', 'hooks', 'minify']);

                  expect(classMap)
                    .toEqual(undefined);

                  expect(inputHtml)
                    .toEqual('<h1 class="a">Hi</h1>');

                  expect(atomizedHtml)
                    .toEqual('<html><head></head><body><h1 class="a">Hi</h1></body></html>');

                  expect(testHelpers.removeErrno(markupErrors[0]))
                    .toEqual({
                      code: 'EACCES',
                      path: 'C:\\home.out.html',
                      syscall: 'open'
                    });
                }
              }
            }
          ]
        }];

        redPerfume.atomize(options);

        expect(options.customLogger.mock.calls[0][0])
          .toEqual('Error writing markup file: C:\\home.out.html');

        expect(testHelpers.removeErrno(options.customLogger.mock.calls[0][1]))
          .toEqual({
            code: 'EACCES',
            path: 'C:\\home.out.html',
            syscall: 'open'
          });

        mockfs.restore();
      });

      test('Fails to write JSON file', () => {
        mockfs({
          'C:\\app.css': '.a{margin:0px;}',
          'C:\\vendor.css': '.b{padding:0px}',
          'C:\\out.json': mockfs.file({
            content: 'Fail',
            mode: parseInt('0000', 8)
          })
        });

        options.tasks = [{
          uglify: true,
          styles: {
            in: [
              'C:\\app.css',
              'C:\\vendor.css'
            ],
            out: 'C:\\out.css'
          },
          scripts: {
            out: 'C:\\out.json',
            hooks: {
              afterOutput: function (options, { task, classMap, scriptErrors }) {
                expect(Object.keys(task))
                  .toEqual(['uglify', 'styles', 'scripts', 'hooks']);

                expect(classMap)
                  .toEqual({
                    '.a': ['.rp__0'],
                    '.b': ['.rp__1']
                  });

                expect(testHelpers.removeErrno(scriptErrors[0]))
                  .toEqual({
                    code: 'EACCES',
                    path: 'C:\\out.json',
                    syscall: 'open'
                  });
              }
            }
          }
        }];

        redPerfume.atomize(options);

        expect(options.customLogger.mock.calls[0][0])
          .toEqual('Error writing script file: C:\\out.json');

        expect(testHelpers.removeErrno(options.customLogger.mock.calls[0][1]))
          .toEqual({
            code: 'EACCES',
            path: 'C:\\out.json',
            syscall: 'open'
          });

        mockfs.restore();
      });

      test('Fails at everything, life is hard', () => {
        const file = {
          content: 'Fail',
          mode: parseInt('0000', 8)
        };
        mockfs({
          'C:\\app.css': mockfs.file(file),
          'C:\\vendor.css': mockfs.file(file),
          'C:\\out.css': mockfs.file(file),
          'C:\\index.html': mockfs.file(file),
          'C:\\out.html': mockfs.file(file),
          'C:\\out.json': mockfs.file(file)
        });

        options.tasks = [
          {
            styles: {
              in: [
                'C:\\app.css',
                'C:\\vendor.css'
              ],
              out: 'C:\\out.css'
            },
            markup: [{
              in: 'C:\\index.html',
              out: 'C:\\out.html'
            }],
            scripts: {
              out: 'C:\\out.json'
            },
            uglify: true
          },
          {
            styles: {
              in: [
                'C:\\app.css',
                'C:\\vendor.css'
              ],
              out: 'C:\\out.css'
            },
            markup: [{
              in: 'C:\\index.html',
              out: 'C:\\out.html'
            }],
            scripts: { out: 'C:\\out.json' }
          }
        ];
        let errorTracker = {
          styles0: 0,
          styles1: 0,
          markup0: 0,
          markup1: 0,
          script0: 0,
          script1: 0
        };
        options.hooks = {
          afterTasks: function (options, results) {
            results.forEach(function ({ task, inputCss, atomizedCss, classMap, allInputMarkup, allAtomizedMarkup, styleErrors, markupErrors, scriptErrors }, index) {
              errorTracker['styles' + index] = styleErrors.length;
              errorTracker['markup' + index] = markupErrors.length;
              errorTracker['scripts' + index] = scriptErrors.length;

              expect(Object.keys(task))
                .toEqual(['styles', 'markup', 'scripts', 'uglify', 'hooks']);

              expect(inputCss)
                .toEqual('');

              expect(atomizedCss)
                .toEqual('');

              expect(classMap)
                .toEqual({});

              expect(allInputMarkup)
                .toEqual(['']);

              expect(allAtomizedMarkup)
                .toEqual(['<html><head></head><body></body></html>']);

              expect(styleErrors.length)
                .toEqual(5);

              expect(markupErrors.length)
                .toEqual(3);

              expect(scriptErrors.length)
                .toEqual(1);

              expect(testHelpers.removeErrno(scriptErrors[0]))
                .toEqual({
                  code: 'EACCES',
                  path: 'C:\\out.json',
                  syscall: 'open'
                });
            });
          }
        };

        const totalErrors = (
          errorTracker.styles0 +
          errorTracker.styles1 +
          errorTracker.markup0 +
          errorTracker.markup1 +
          errorTracker.script0 +
          errorTracker.script1
        );

        expect(totalErrors)
          .toEqual(options.customLogger.mock.calls.length);

        redPerfume.atomize(options);

        const errorsForOneTask = [
          [
            'Error reading style file: C:\\app.css',
            expect.objectContaining({
              code: 'EACCES',
              path: 'C:\\app.css',
              syscall: 'open'
            })
          ],
          [
            'Error reading style file: C:\\vendor.css',
            expect.objectContaining({
              code: 'EACCES',
              path: 'C:\\vendor.css',
              syscall: 'open'
            })
          ],
          [
            'Invalid CSS input.',
            null
          ],
          [
            'Error parsing CSS',
            ''
          ],
          [
            'Error writing CSS file: C:\\out.css',
            expect.objectContaining({
              code: 'EACCES',
              path: 'C:\\out.css',
              syscall: 'open'
            })
          ],
          [
            'Error reading markup file: C:\\index.html',
            expect.objectContaining({
              code: 'EACCES',
              path: 'C:\\index.html',
              syscall: 'open'
            })
          ],
          [
            'Error parsing HTML',
            '<html><head></head><body></body></html>'
          ],
          [
            'Error writing markup file: C:\\out.html',
            expect.objectContaining({
              code: 'EACCES',
              path: 'C:\\out.html',
              syscall: 'open'
            })
          ],
          [
            'Error writing script file: C:\\out.json',
            expect.objectContaining({
              code: 'EACCES',
              path: 'C:\\out.json',
              syscall: 'open'
            })
          ]
        ];

        expect(JSON.parse(JSON.stringify(options.customLogger.mock.calls)))
          .toEqual([...errorsForOneTask, ...errorsForOneTask]);

        mockfs.restore();
      });
    });

    describe('Valid options with tasks', () => {
      test('Using file system', () => {
        mockfs({
          'C:\\app.css': '.a{margin:0px;}',
          'C:\\vendor.css': '.b{padding:0px}',
          'C:\\home.html': '<h1 class="a">Hi</h1>',
          'C:\\about.html': '<h2 class="b">Yo</h2>'
        });

        options.tasks = [{
          uglify: true,
          styles: {
            in: [
              'C:\\app.css',
              'C:\\vendor.css'
            ],
            out: 'C:\\out.css',
            hooks: {
              afterOutput: function () {
                let expectation = testHelpers.trimIndentation(`
                  .rp__0 {
                    margin: 0px;
                  }
                  .rp__1 {
                    padding: 0px;
                  }
                `, 18);

                expect(String(fs.readFileSync('C:\\out.css')))
                  .toEqual(expectation + '\n');
              }
            }
          },
          markup: [
            {
              in: 'C:\\home.html',
              out: 'C:\\home.out.html',
              hooks: {
                afterOutput: function () {
                  expect(String(fs.readFileSync('C:\\home.out.html')))
                    .toEqual('<html><head></head><body><h1 class="rp__0">Hi</h1></body></html>\n');
                }
              }
            },
            {
              in: 'C:\\about.html',
              out: 'C:\\about.out.html',
              hooks: {
                afterOutput: function () {
                  expect(String(fs.readFileSync('C:\\about.out.html')))
                    .toEqual('<html><head></head><body><h2 class="rp__1">Yo</h2></body></html>\n');
                }
              }
            }
          ],
          scripts: {
            out: 'C:\\out.json',
            hooks: {
              afterOutput: function () {
                let expectation = testHelpers.trimIndentation(`
                  {
                    ".a": [
                      ".rp__0"
                    ],
                    ".b": [
                      ".rp__1"
                    ]
                  }
                `, 18);

                expect(String(fs.readFileSync('C:\\out.json')))
                  .toEqual(expectation + '\n');
              }
            }
          }
        }];

        redPerfume.atomize(options);

        expect(options.customLogger)
          .not.toHaveBeenCalled();

        mockfs.restore();
      });

      test('Using file system but all files are empty', () => {
        mockfs({
          'C:\\app.css': '',
          'C:\\vendor.css': '',
          'C:\\home.html': '',
          'C:\\about.html': ''
        });

        options.tasks = [{
          uglify: true,
          styles: {
            in: [
              'C:\\app.css',
              'C:\\vendor.css'
            ],
            out: 'C:\\out.css',
            hooks: {
              afterOutput: function () {
                expect(String(fs.readFileSync('C:\\out.css')))
                  .toEqual('\n');
              }
            }
          },
          markup: [
            {
              in: 'C:\\home.html',
              out: 'C:\\home.out.html',
              hooks: {
                afterOutput: function () {
                  expect(String(fs.readFileSync('C:\\home.out.html')))
                    .toEqual('<html><head></head><body></body></html>\n');
                }
              }
            },
            {
              in: 'C:\\about.html',
              out: 'C:\\about.out.html',
              hooks: {
                afterOutput: function () {
                  expect(String(fs.readFileSync('C:\\about.out.html')))
                    .toEqual('<html><head></head><body></body></html>\n');
                }
              }
            }
          ],
          scripts: {
            out: 'C:\\out.json',
            hooks: {
              afterOutput: function () {
                expect(String(fs.readFileSync('C:\\out.json')))
                  .toEqual('{}\n');
              }
            }
          }
        }];

        redPerfume.atomize(options);

        expect(options.customLogger)
          .toHaveBeenCalledWith('Error parsing CSS', '');

        expect(options.customLogger)
          .toHaveBeenCalledWith('Error parsing HTML', '<html><head></head><body></body></html>');

        expect(options.customLogger)
          .toHaveBeenCalledWith('Error parsing HTML', '<html><head></head><body></body></html>');

        mockfs.restore();
      });

      test('Using data and afterOutput hook', () => {
        const cssString = '.example { padding: 10px; margin: 10px; }';
        const markupString = '<!DOCTYPE html><html><body><div class="example"></div></body></html>';
        const expectedClassMap = {
          '.example': ['.rp__0', '.rp__1']
        };
        let output = testHelpers.trimIndentation(`
          .rp__0 {
            padding: 10px;
          }
          .rp__1 {
            margin: 10px;
          }
        `, 10);

        options = {
          verbose: true,
          customLogger: jest.fn(),
          tasks: [
            {
              uglify: true,
              styles: {
                data: cssString,
                hooks: {
                  afterOutput: function (options, { task, inputCss, atomizedCss, classMap, styleErrors }) {
                    expect(Object.keys(task))
                      .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                    expect(inputCss)
                      .toEqual(cssString);

                    expect(atomizedCss)
                      .toEqual(output);

                    expect(classMap)
                      .toEqual(expectedClassMap);

                    expect(styleErrors)
                      .toEqual([]);
                  }
                }
              },
              markup: [
                {
                  data: markupString,
                  hooks: {
                    afterOutput: function (options, { task, subTask, classMap, inputHtml, atomizedHtml, markupErrors }) {
                      expect(Object.keys(task))
                        .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                      expect(Object.keys(subTask))
                        .toEqual(['data', 'hooks', 'minify']);

                      expect(classMap)
                        .toEqual(expectedClassMap);

                      expect(inputHtml)
                        .toEqual(markupString);

                      expect(atomizedHtml)
                        .toEqual('<!DOCTYPE html><html><head></head><body><div class="rp__0 rp__1"></div></body></html>');

                      expect(markupErrors)
                        .toEqual([]);
                    }
                  }
                }
              ],
              scripts: {
                hooks: {
                  afterOutput: function (options, { task, classMap, scriptErrors }) {
                    expect(Object.keys(task))
                      .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                    expect(classMap)
                      .toEqual(expectedClassMap);

                    expect(scriptErrors)
                      .toEqual([]);
                  }
                }
              }
            }
          ]
        };

        redPerfume.atomize(options);

        expect(options.customLogger)
          .not.toHaveBeenCalled();
      });

      test('Runs all global hooks', () => {
        mockfs({
          'C:\\app.css': '.a{margin:0px}',
          'C:\\vendor.css': '.b{padding:0px}',
          'C:\\home.html': '<h1 class="a">Hi</h1>',
          'C:\\about.html': '<h2 class="b">Yo</h2>'
        });

        options.hooks = {
          beforeValidation: function (options) {
            expect(Object.keys(options))
              .toEqual(['verbose', 'customLogger', 'hooks', 'tasks']);
          },
          afterValidation: function (options) {
            expect(Object.keys(options))
              .toEqual(['verbose', 'customLogger', 'hooks', 'tasks']);
          },
          beforeTasks: function (options) {
            expect(Object.keys(options))
              .toEqual(['verbose', 'customLogger', 'hooks', 'tasks']);
          },
          afterTasks: function (options, results) {
            expect(Object.keys(options))
              .toEqual(['verbose', 'customLogger', 'hooks', 'tasks']);

            results.forEach(({ task, inputCss, atomizedCss, classMap, allInputMarkup, allAtomizedMarkup, styleErrors, markupErrors, scriptErrors }) => {
              expect(Object.keys(task))
                .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

              expect(inputCss)
                .toEqual('.a{margin:0px}.b{padding:0px}.c{border:0px}');

              expect(atomizedCss)
                .toEqual(testHelpers.trimIndentation(`
                  .rp__0 {
                    margin: 0px;
                  }
                  .rp__1 {
                    padding: 0px;
                  }
                  .rp__2 {
                    border: 0px;
                  }`, 18));

              expect(classMap)
                .toEqual({
                  '.a': ['.rp__0'],
                  '.b': ['.rp__1'],
                  '.c': ['.rp__2']
                });

              expect(allInputMarkup)
                .toEqual([
                  '<h1 class="a">Hi</h1>',
                  '<h2 class="b">Yo</h2>'
                ]);

              expect(allAtomizedMarkup)
                .toEqual([
                  '<html><head></head><body><h1 class=\"rp__0\">Hi</h1></body></html>',
                  '<html><head></head><body><h2 class=\"rp__1\">Yo</h2></body></html>'
                ]);

              expect(styleErrors)
                .toEqual([]);

              expect(markupErrors)
                .toEqual([]);

              expect(scriptErrors)
                .toEqual([]);
            });
          }
        };

        options.tasks = [{
          uglify: true,
          styles: {
            in: [
              'C:\\app.css',
              'C:\\vendor.css'
            ],
            data: '.c{border:0px}',
            out: 'C:\\out.css'
          },
          markup: [
            {
              in: 'C:\\home.html',
              out: 'C:\\home.out.html'
            },
            {
              in: 'C:\\about.html',
              out: 'C:\\about.out.html'
            }
          ],
          scripts: {
            out: 'C:\\out.json'
          }
        }];

        redPerfume.atomize(options);

        expect(options.customLogger)
          .not.toHaveBeenCalled();

        mockfs.restore();
      });

      describe('Every type of CSS', () => {
        const inputMarkup = testHelpers.trimIndentation(`
          <!DOCTYPE html>
          <html>
            <body>
              <div class="simple pseudo"></div>
              <div class="after">
                <div class="nested"></div>
              </div>
            </body>
          </html>
        `, 10);

        describe('Simple', () => {
          const simpleCSS = `
            .simple {
              padding: 10px;
              margin: 10px;
            }
          `;

          test('Normal', () => {
            const expectedClassMap = {
              '.simple': [
                '.rp__padding__--COLON10px',
                '.rp__margin__--COLON10px'
              ]
            };
            const output = testHelpers.trimIndentation(`
              .rp__padding__--COLON10px {
                padding: 10px;
              }
              .rp__margin__--COLON10px {
                margin: 10px;
              }
            `, 14);
            options = {
              verbose: true,
              customLogger: jest.fn(),
              tasks: [
                {
                  uglify: false,
                  styles: {
                    data: simpleCSS,
                    hooks: {
                      afterOutput: function (options, { task, inputCss, atomizedCss, classMap, styleErrors }) {
                        expect(Object.keys(task))
                          .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                        expect(inputCss)
                          .toEqual(simpleCSS);

                        expect(atomizedCss)
                          .toEqual(output);

                        expect(classMap)
                          .toEqual(expectedClassMap);

                        expect(styleErrors)
                          .toEqual([]);
                      }
                    }
                  },
                  markup: [
                    {
                      data: inputMarkup,
                      hooks: {
                        afterOutput: function (options, { task, subTask, classMap, inputHtml, atomizedHtml, markupErrors }) {
                          expect(Object.keys(task))
                            .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                          expect(Object.keys(subTask))
                            .toEqual(['data', 'hooks', 'minify']);

                          expect(classMap)
                            .toEqual(expectedClassMap);

                          expect(inputHtml)
                            .toEqual(inputMarkup);

                          expect(testHelpers.trimIndentation(atomizedHtml))
                            .toEqual(testHelpers.trimIndentation(`
                              <!DOCTYPE html><html><head></head><body>
                                <div class="pseudo rp__padding__--COLON10px rp__margin__--COLON10px"></div>
                                <div class="after">
                                  <div class="nested"></div>
                                </div>
                              </body></html>
                            `, 30));

                          expect(markupErrors)
                            .toEqual([]);
                        }
                      }
                    }
                  ],
                  scripts: {
                    hooks: {
                      afterOutput: function (options, { task, classMap, scriptErrors }) {
                        expect(Object.keys(task))
                          .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                        expect(classMap)
                          .toEqual(expectedClassMap);

                        expect(scriptErrors)
                          .toEqual([]);
                      }
                    }
                  }
                }
              ]
            };

            redPerfume.atomize(options);

            expect(options.customLogger)
              .not.toHaveBeenCalled();
          });

          test('Uglify', () => {
            const expectedClassMap = {
              '.simple': [
                '.rp__0',
                '.rp__1'
              ]
            };
            const output = testHelpers.trimIndentation(`
              .rp__0 {
                padding: 10px;
              }
              .rp__1 {
                margin: 10px;
              }
            `, 14);

            options = {
              verbose: true,
              customLogger: jest.fn(),
              tasks: [
                {
                  uglify: true,
                  styles: {
                    data: simpleCSS,
                    hooks: {
                      afterOutput: function (options, { task, inputCss, atomizedCss, classMap, styleErrors }) {
                        expect(Object.keys(task))
                          .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                        expect(inputCss)
                          .toEqual(simpleCSS);

                        expect(atomizedCss)
                          .toEqual(output);

                        expect(classMap)
                          .toEqual(expectedClassMap);

                        expect(styleErrors)
                          .toEqual([]);
                      }
                    }
                  },
                  markup: [
                    {
                      data: inputMarkup,
                      hooks: {
                        afterOutput: function (options, { task, subTask, classMap, inputHtml, atomizedHtml, markupErrors }) {
                          expect(Object.keys(task))
                            .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                          expect(Object.keys(subTask))
                            .toEqual(['data', 'hooks', 'minify']);

                          expect(classMap)
                            .toEqual(expectedClassMap);

                          expect(inputHtml)
                            .toEqual(inputMarkup);

                          expect(testHelpers.trimIndentation(atomizedHtml))
                            .toEqual(testHelpers.trimIndentation(`
                              <!DOCTYPE html><html><head></head><body>
                                <div class="pseudo rp__0 rp__1"></div>
                                <div class="after">
                                  <div class="nested"></div>
                                </div>
                              </body></html>
                            `, 30));

                          expect(markupErrors)
                            .toEqual([]);
                        }
                      }
                    }
                  ],
                  scripts: {
                    hooks: {
                      afterOutput: function (options, { task, classMap, scriptErrors }) {
                        expect(Object.keys(task))
                          .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                        expect(classMap)
                          .toEqual(expectedClassMap);

                        expect(scriptErrors)
                          .toEqual([]);
                      }
                    }
                  }
                }
              ]
            };

            redPerfume.atomize(options);

            expect(options.customLogger)
              .not.toHaveBeenCalled();
          });
        });

        describe('Pseudo', () => {
          const pseudoCSS = `
            .pseudo {
              color: #F00;
              text-decoration: none;
            }
            .pseudo:hover {
              color: #A00;
              text-decoration: underline;
            }
          `;

          test('Normal', () => {
            const expectedClassMap = {
              '.pseudo': [
                '.rp__color__--COLON__--OCTOTHORPF00',
                '.rp__text-decoration__--COLONnone',
                '.rp__color__--COLON__--OCTOTHORPA00___-HOVER',
                '.rp__text-decoration__--COLONunderline___-HOVER'
              ]
            };

            options = {
              verbose: true,
              customLogger: jest.fn(),
              tasks: [
                {
                  uglify: false,
                  styles: {
                    data: pseudoCSS,
                    hooks: {
                      afterOutput: function (options, { task, inputCss, atomizedCss, classMap, styleErrors }) {
                        expect(Object.keys(task))
                          .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                        expect(inputCss)
                          .toEqual(pseudoCSS);

                        expect(atomizedCss)
                          .toEqual(testHelpers.trimIndentation(`
                            .rp__color__--COLON__--OCTOTHORPF00 {
                              color: #F00;
                            }
                            .rp__text-decoration__--COLONnone {
                              text-decoration: none;
                            }
                            .rp__color__--COLON__--OCTOTHORPA00___-HOVER:hover {
                              color: #A00;
                            }
                            .rp__text-decoration__--COLONunderline___-HOVER:hover {
                              text-decoration: underline;
                            }
                          `, 28));

                        expect(classMap)
                          .toEqual(expectedClassMap);

                        expect(styleErrors)
                          .toEqual([]);
                      }
                    }
                  },
                  markup: [
                    {
                      data: inputMarkup,
                      hooks: {
                        afterOutput: function (options, { task, subTask, classMap, inputHtml, atomizedHtml, markupErrors }) {
                          expect(Object.keys(task))
                            .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                          expect(Object.keys(subTask))
                            .toEqual(['data', 'hooks', 'minify']);

                          expect(classMap)
                            .toEqual(expectedClassMap);

                          expect(inputHtml)
                            .toEqual(inputMarkup);

                          expect(testHelpers.trimIndentation(atomizedHtml))
                            .toEqual(testHelpers.trimIndentation(`
                              <!DOCTYPE html><html><head></head><body>
                                <div class="simple rp__color__--COLON__--OCTOTHORPF00 rp__text-decoration__--COLONnone rp__color__--COLON__--OCTOTHORPA00___-HOVER rp__text-decoration__--COLONunderline___-HOVER"></div>
                                <div class="after">
                                  <div class="nested"></div>
                                </div>
                              </body></html>
                            `, 30));

                          expect(markupErrors)
                            .toEqual([]);
                        }
                      }
                    }
                  ],
                  scripts: {
                    hooks: {
                      afterOutput: function (options, { task, classMap, scriptErrors }) {
                        expect(Object.keys(task))
                          .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                        expect(classMap)
                          .toEqual(expectedClassMap);

                        expect(scriptErrors)
                          .toEqual([]);
                      }
                    }
                  }
                }
              ]
            };

            redPerfume.atomize(options);

            expect(options.customLogger)
              .not.toHaveBeenCalled();
          });

          test('Uglify', () => {
            const expectedClassMap = {
              '.pseudo': [
                '.rp__0',
                '.rp__1',
                '.rp__2',
                '.rp__3'
              ]
            };

            options = {
              verbose: true,
              customLogger: jest.fn(),
              tasks: [
                {
                  uglify: true,
                  styles: {
                    data: pseudoCSS,
                    hooks: {
                      afterOutput: function (options, { task, inputCss, atomizedCss, classMap, styleErrors }) {
                        expect(Object.keys(task))
                          .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                        expect(inputCss)
                          .toEqual(pseudoCSS);

                        expect(atomizedCss)
                          .toEqual(testHelpers.trimIndentation(`
                            .rp__0 {
                              color: #F00;
                            }
                            .rp__1 {
                              text-decoration: none;
                            }
                            .rp__2:hover {
                              color: #A00;
                            }
                            .rp__3:hover {
                              text-decoration: underline;
                            }
                          `, 28));

                        expect(classMap)
                          .toEqual(expectedClassMap);

                        expect(styleErrors)
                          .toEqual([]);
                      }
                    }
                  },
                  markup: [
                    {
                      data: inputMarkup,
                      hooks: {
                        afterOutput: function (options, { task, subTask, classMap, inputHtml, atomizedHtml, markupErrors }) {
                          expect(Object.keys(task))
                            .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                          expect(Object.keys(subTask))
                            .toEqual(['data', 'hooks', 'minify']);

                          expect(classMap)
                            .toEqual(expectedClassMap);

                          expect(inputHtml)
                            .toEqual(inputMarkup);

                          expect(testHelpers.trimIndentation(atomizedHtml))
                            .toEqual(testHelpers.trimIndentation(`
                              <!DOCTYPE html><html><head></head><body>
                                <div class="simple rp__0 rp__1 rp__2 rp__3"></div>
                                <div class="after">
                                  <div class="nested"></div>
                                </div>
                              </body></html>
                            `, 30));

                          expect(markupErrors)
                            .toEqual([]);
                        }
                      }
                    }
                  ],
                  scripts: {
                    hooks: {
                      afterOutput: function (options, { task, classMap, scriptErrors }) {
                        expect(Object.keys(task))
                          .toEqual(['uglify', 'styles', 'markup', 'scripts', 'hooks']);

                        expect(classMap)
                          .toEqual(expectedClassMap);

                        expect(scriptErrors)
                          .toEqual([]);
                      }
                    }
                  }
                }
              ]
            };

            redPerfume.atomize(options);

            expect(options.customLogger)
              .not.toHaveBeenCalled();
          });
        });
      });
    });
  });
});
