const css = require('@/css.js');

const testHelpers = require('@@/testHelpers.js');

describe('CSS', () => {
  let options;
  const errorResponse = {
    classMap: {},
    output: ''
  };

  beforeEach(() => {
    options = {
      verbose: true,
      customLogger: jest.fn()
    };
  });

  describe('removeIdenticalProperties', () => {
    test('Removes dupes', () => {
      expect(css.removeIdenticalProperties({
        '.duplicates': [
          '.rp__display__--COLONnone',
          '.rp__display__--COLONblock',
          '.rp__display__--COLONnone',
          '.rp__display__--COLONinline-block',
          '.rp__display__--COLONnone',
          '.rp__display__--COLONflex'
        ]
      }))
        .toEqual({
          '.duplicates': [
            '.rp__display__--COLONblock',
            '.rp__display__--COLONinline-block',
            '.rp__display__--COLONnone',
            '.rp__display__--COLONflex'
          ]
        });
    });
  });

  describe('Bad inputs', () => {
    test('Empty', () => {
      expect(css())
        .toEqual(errorResponse);

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Just options', () => {
      expect(css(options))
        .toEqual(errorResponse);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Error parsing CSS', '');
    });

    test('Options, empty string', () => {
      expect(css(options, ''))
        .toEqual(errorResponse);

      expect(options.customLogger)
        .toHaveBeenCalledWith('Error parsing CSS', '');
    });

    test('Options, HTML', () => {
      expect(css(options, '<h1>Bad</h1>'))
        .toEqual(errorResponse);

      let firstError = options.customLogger.mock.calls[0];
      let secondError = options.customLogger.mock.calls[1];

      expect(JSON.stringify(firstError))
        .toEqual('["Error parsing CSS",{"reason":"missing \'{\'","line":1,"column":13,"source":""}]');

      expect(secondError)
        .toEqual(['Error parsing CSS', '<h1>Bad</h1>']);
    });
  });

  describe('Process CSS', () => {
    test('One rule', () => {
      expect(css(options, '.test { background: #F00; }', false))
        .toEqual({
          classMap: {
            '.test': [
              '.rp__background__--COLON__--OCTOTHORPF00'
            ]
          },
          output: '.rp__background__--COLON__--OCTOTHORPF00 {\n  background: #F00;\n}'
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('One rule uglified', () => {
      expect(css(options, '.test { background: #F00; }', true))
        .toEqual({
          classMap: {
            '.test': [
              '.rp__0'
            ]
          },
          output: '.rp__0 {\n  background: #F00;\n}'
        });

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Handle non-classes', () => {
      let input = `
        h1 {
          background: #F00;
          border: 1px solid #00F;
        }
        [attr] {
          text-transform: small-caps;
          overflow: hidden;
        }
        [attr="123"] {
          position: absolute;
          border-radius: 2px;
        }
        .example {
          display: block;
          text-align: center
        }
        #specificity-overkill {
          color: #FF0;
          z-index: 2;
        }
      `;

      expect(css(options, input, false).output)
        .toEqual(testHelpers.trimIndentation(`
          h1 {
            background: #F00;
            border: 1px solid #00F;
          }
          [attr] {
            text-transform: small-caps;
            overflow: hidden;
          }
          [attr="123"] {
            position: absolute;
            border-radius: 2px;
          }
          .rp__display__--COLONblock {
            display: block;
          }
          .rp__text-align__--COLONcenter {
            text-align: center;
          }
          #specificity-overkill {
            color: #FF0;
            z-index: 2;
          }
        `, 10));
    });
  });
});
