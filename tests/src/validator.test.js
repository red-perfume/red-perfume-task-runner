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
});
