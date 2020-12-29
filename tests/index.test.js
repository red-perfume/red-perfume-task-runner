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
          `, 12), undefined);

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
            result: function (data, err) {
              expect(data)
                .toEqual('');

              expect(testHelpers.removeErrno(err))
                .toEqual({
                  syscall: 'open',
                  code: 'EACCES',
                  path:'C:\\app.css'
                });
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
            result: function (data, err) {
              let expectation = testHelpers.trimIndentation(`
                .rp__0 {
                  margin: 0px;
                }
              `, 16);

              expect(data)
                .toEqual(expectation);

              expect(testHelpers.removeErrno(err))
                .toEqual({
                  code: 'EACCES',
                  path: 'C:\\out.css',
                  syscall: 'open'
                });
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
              result: function (data, err) {
                expect(data)
                  .toEqual('<html><head></head><body></body></html>');

                expect(testHelpers.removeErrno(err))
                  .toEqual({
                    syscall: 'open',
                    code: 'EACCES',
                    path:'C:\\home.html'
                  });
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
              result: function (data, err) {
                expect(data)
                  .toEqual('<html><head></head><body><h1 class="a">Hi</h1></body></html>');

                expect(testHelpers.removeErrno(err))
                  .toEqual({
                    code: 'EACCES',
                    path: 'C:\\home.out.html',
                    syscall: 'open'
                  });
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
            result: function (data, err) {
              expect(data)
                .toEqual({
                  '.a': ['.rp__0'],
                  '.b': ['.rp__1']
                });

              expect(testHelpers.removeErrno(err))
                .toEqual({
                  code: 'EACCES',
                  path: 'C:\\out.json',
                  syscall: 'open'
                });
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
            result: function () {
              let expectation = testHelpers.trimIndentation(`
                .rp__0 {
                  margin: 0px;
                }
                .rp__1 {
                  padding: 0px;
                }
              `, 16);

              expect(String(fs.readFileSync('C:\\out.css')))
                .toEqual(expectation + '\n');
            }
          },
          markup: [
            {
              in: 'C:\\home.html',
              out: 'C:\\home.out.html',
              result: function () {
                expect(String(fs.readFileSync('C:\\home.out.html')))
                  .toEqual('<html><head></head><body><h1 class="rp__0">Hi</h1></body></html>\n');
              }
            },
            {
              in: 'C:\\about.html',
              out: 'C:\\about.out.html',
              result: function () {
                expect(String(fs.readFileSync('C:\\about.out.html')))
                  .toEqual('<html><head></head><body><h2 class="rp__1">Yo</h2></body></html>\n');
              }
            }
          ],
          scripts: {
            out: 'C:\\out.json',
            result: function () {
              let expectation = testHelpers.trimIndentation(`
                {
                  ".a": [
                    ".rp__0"
                  ],
                  ".b": [
                    ".rp__1"
                  ]
                }
              `, 16);

              expect(String(fs.readFileSync('C:\\out.json')))
                .toEqual(expectation + '\n');
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
            result: function () {
              expect(String(fs.readFileSync('C:\\out.css')))
                .toEqual('\n');
            }
          },
          markup: [
            {
              in: 'C:\\home.html',
              out: 'C:\\home.out.html',
              result: function () {
                expect(String(fs.readFileSync('C:\\home.out.html')))
                  .toEqual('<html><head></head><body></body></html>\n');
              }
            },
            {
              in: 'C:\\about.html',
              out: 'C:\\about.out.html',
              result: function () {
                expect(String(fs.readFileSync('C:\\about.out.html')))
                  .toEqual('<html><head></head><body></body></html>\n');
              }
            }
          ],
          scripts: {
            out: 'C:\\out.json',
            result: function () {
              expect(String(fs.readFileSync('C:\\out.json')))
                .toEqual('{}\n');
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

      test('Using data and result', () => {
        options = {
          verbose: true,
          customLogger: jest.fn(),
          tasks: [
            {
              uglify: true,
              styles: {
                data: '.example { padding: 10px; margin: 10px; }',
                result: function (result, err) {
                  let expectation = testHelpers.trimIndentation(`
                    .rp__0 {
                      padding: 10px;
                    }
                    .rp__1 {
                      margin: 10px;
                    }
                  `, 20);

                  expect(result)
                    .toEqual(expectation, undefined);

                  expect(err)
                    .toEqual(undefined);
                }
              },
              markup: [
                {
                  data: '<!DOCTYPE html><html><body><div class="example"></div></body></html>',
                  result: function (result, err) {
                    expect(result)
                      .toEqual('<!DOCTYPE html><html><head></head><body><div class="rp__0 rp__1"></div></body></html>');

                    expect(err)
                      .toEqual(undefined);
                  }
                }
              ],
              scripts: {
                result: function (result, err) {
                  expect(result)
                    .toEqual({
                      '.example': [
                        '.rp__0',
                        '.rp__1'
                      ]
                    });

                  expect(err)
                    .toEqual(undefined);
                }
              }
            }
          ]
        };

        redPerfume.atomize(options);

        expect(options.customLogger)
          .not.toHaveBeenCalled();
      });

      test('Every type of CSS', () => {
        options = {
          verbose: true,
          customLogger: jest.fn(),
          tasks: [
            {
              uglify: true,
              styles: {
                data: `
                  .simple {
                    padding: 10px;
                    margin: 10px;
                  }
                  .pseudo {
                    color: #F00;
                    text-decoration: none;
                  }
                  .pseudo:hover {
                    color: #A00;
                    text-decoration: underline;
                  }
                `,
                result: function (result, err) {
                  let expectation = testHelpers.trimIndentation(`
                    .rp__0 {
                      padding: 10px;
                    }
                    .rp__1 {
                      margin: 10px;
                    }
                    .rp__2 {
                      color: #F00;
                    }
                    .rp__3 {
                      text-decoration: none;
                    }
                    .rp__4:hover {
                      color: #A00;
                    }
                    .rp__5:hover {
                      text-decoration: underline;
                    }
                  `, 20);

                  expect(result)
                    .toEqual(expectation, undefined);

                  expect(err)
                    .toEqual(undefined);
                }
              },
              markup: [
                {
                  data: testHelpers.trimIndentation(`
                    <!DOCTYPE html>
                    <html>
                      <body>
                        <div class="simple pseudo"></div>
                        <div class="after">
                          <div class="nested"></div>
                        </div>
                      </body>
                    </html>
                  `, 20),
                  result: function (result, err) {
                    expect(testHelpers.trimIndentation(result))
                      .toEqual(testHelpers.trimIndentation(`
                        <!DOCTYPE html><html><head></head><body>
                          <div class="rp__0 rp__1 rp__2 rp__3 rp__4 rp__5"></div>
                          <div class="after">
                            <div class="nested"></div>
                          </div>
                        </body></html>
                      `, 24));

                    expect(err)
                      .toEqual(undefined);
                  }
                }
              ],
              scripts: {
                result: function (result, err) {
                  expect(result)
                    .toEqual({
                      '.simple': [
                        '.rp__0',
                        '.rp__1'
                      ],
                      '.pseudo': [
                        '.rp__2',
                        '.rp__3',
                        '.rp__4',
                        '.rp__5'
                      ]
                    });

                  expect(err)
                    .toEqual(undefined);
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
