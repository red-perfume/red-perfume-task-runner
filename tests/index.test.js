const mockfs = require('mock-fs');
const fs = require('fs');
const redPerfume = require('../index.js');

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
    test('Empty', () => {
      let consoleError = console.error;
      console.error = jest.fn();

      expect(redPerfume.atomize())
        .toEqual(undefined);

      expect(console.error)
        .toHaveBeenCalledWith('_________________________\nRed-Perfume:\noptions.tasks Must be an array of objects. See documentation for details.', undefined);

      console.error = consoleError;
      consoleError = undefined;
    });

    test('Valid options with tasks using file system', async () => {
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
            expect(String(fs.readFileSync('C:\\out.css')))
              .toEqual('.rp__0 {\n  margin: 0px;\n}\n.rp__1 {\n  padding: 0px;\n}');
          }
        },
        markup: [
          {
            in: 'C:\\home.html',
            out: 'C:\\home.out.html',
            result: function () {
              expect(String(fs.readFileSync('C:\\home.out.html')))
                .toEqual('<html><head></head><body><h1 class="rp__0">Hi</h1></body></html>');
            }
          },
          {
            in: 'C:\\about.html',
            out: 'C:\\about.out.html',
            result: function () {
              expect(String(fs.readFileSync('C:\\about.out.html')))
                .toEqual('<html><head></head><body><h2 class="rp__1">Yo</h2></body></html>');
            }
          }
        ],
        scripts: {
          out: 'C:\\out.json',
          result: function () {
            expect(String(fs.readFileSync('C:\\out.json')))
              .toEqual('{\n  ".a": [\n    ".rp__0"\n  ],\n  ".b": [\n    ".rp__1"\n  ]\n}');
          }
        }
      }];

      redPerfume.atomize(options);

      expect(options.customLogger)
        .not.toHaveBeenCalled();

      mockfs.restore();
    });

    test('Fails to read CSS file', async () => {
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

            expect(JSON.parse(JSON.stringify(err)))
              .toEqual([
                {
                  syscall: 'open',
                  code: 'EACCES',
                  errno: -4092,
                  path:'C:\\app.css'
                }
              ]);
          }
        }
      }];

      redPerfume.atomize(options);

      expect(options.customLogger.mock.calls[0][0])
        .toEqual('Error reading style file: C:\\app.css');

      expect(JSON.parse(JSON.stringify(options.customLogger.mock.calls[0][1])))
        .toEqual({
          code: 'EACCES',
          errno: -4092,
          path: 'C:\\app.css',
          syscall: 'open'
        });

      expect(options.customLogger)
        .toHaveBeenCalledWith('Error parsing CSS', '');

      mockfs.restore();
    });

    test('Fails to write CSS file', async () => {
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
            expect(data)
              .toEqual('.rp__0 {\n  margin: 0px;\n}');

            expect(JSON.parse(JSON.stringify(err)))
              .toEqual([
                {
                  code: 'EACCES',
                  errno: -4092,
                  path: 'C:\\out.css',
                  syscall: 'open'
                }
              ]);
          }
        }
      }];

      redPerfume.atomize(options);

      expect(options.customLogger.mock.calls[0][0])
        .toEqual('Error writing CSS file: C:\\out.css');

      expect(JSON.parse(JSON.stringify(options.customLogger.mock.calls[0][1])))
        .toEqual({
          code: 'EACCES',
          errno: -4092,
          path: 'C:\\out.css',
          syscall: 'open'
        });

      mockfs.restore();
    });

    test('Fails to read HTML file', async () => {
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

              expect(JSON.parse(JSON.stringify(err)))
                .toEqual([
                  {
                    syscall: 'open',
                    code: 'EACCES',
                    errno: -4092,
                    path:'C:\\home.html'
                  }
                ]);
            }
          }
        ]
      }];

      redPerfume.atomize(options);

      expect(options.customLogger.mock.calls[0][0])
        .toEqual('Error reading markup file: C:\\home.html');

      expect(JSON.parse(JSON.stringify(options.customLogger.mock.calls[0][1])))
        .toEqual({
          code: 'EACCES',
          errno: -4092,
          path: 'C:\\home.html',
          syscall: 'open'
        });

      expect(options.customLogger)
        .toHaveBeenCalledWith('Error parsing HTML', '<html><head></head><body></body></html>');

      mockfs.restore();
    });

    test('Fails to write HTML file', async () => {
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

              expect(JSON.parse(JSON.stringify(err)))
                .toEqual([
                  {
                    code: 'EACCES',
                    errno: -4092,
                    path: 'C:\\home.out.html',
                    syscall: 'open'
                  }
                ]);
            }
          }
        ]
      }];

      redPerfume.atomize(options);

      expect(options.customLogger.mock.calls[0][0])
        .toEqual('Error writing markup file: C:\\home.out.html');

      expect(JSON.parse(JSON.stringify(options.customLogger.mock.calls[0][1])))
        .toEqual({
          code: 'EACCES',
          errno: -4092,
          path: 'C:\\home.out.html',
          syscall: 'open'
        });

      mockfs.restore();
    });

    test('Fails to write JSON file', async () => {
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

            expect(JSON.parse(JSON.stringify(err)))
              .toEqual({
                code: 'EACCES',
                errno: -4092,
                path: 'C:\\out.json',
                syscall: 'open'
              });
          }
        }
      }];

      redPerfume.atomize(options);

      expect(options.customLogger.mock.calls[0][0])
        .toEqual('Error writing script file: C:\\out.json');

      expect(JSON.parse(JSON.stringify(options.customLogger.mock.calls[0][1])))
        .toEqual({
          code: 'EACCES',
          errno: -4092,
          path: 'C:\\out.json',
          syscall: 'open'
        });

      mockfs.restore();
    });


    test('Valid options with tasks using data and result', () => {
      options = {
        verbose: true,
        customLogger: jest.fn(),
        tasks: [
          {
            uglify: true,
            styles: {
              data: '.example { padding: 10px; margin: 10px; }',
              result: function (result, err) {
                expect(result)
                  .toEqual('.rp__0 {\n  padding: 10px;\n}\n.rp__1 {\n  margin: 10px;\n}', undefined);

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
  });
});
