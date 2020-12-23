const mockfs = require('mock-fs');
const validator = require('@/validator.js');

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

  describe('validateFunction', () => {
    test('Falsy', () => {
      expect(validator.validateFunction(options, false, 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Not a function', () => {
      expect(validator.validateFunction(options, 'key', 'message'))
        .toEqual(undefined);

      expect(options.customLogger)
        .toHaveBeenCalledWith('message', undefined);
    });

    test('Function', () => {
      const fn = function () {};
      expect(validator.validateFunction(options, fn, 'message'))
        .toEqual(fn);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
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
});
