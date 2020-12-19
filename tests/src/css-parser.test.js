const validator = require('@/validator.js').validateOptions;
const cssParser = require('@/css-parser.js');

describe('CSS parser', () => {
  let options;

  beforeEach(() => {
    options = validator({});
  });

  describe('Bad inputs', () => {
    test('Empty', () => {
      expect(cssParser(options, undefined))
        .toEqual(undefined);
    });
  });

  describe('Parses string to AST', () => {
    test('One rule, one selector, one declaration', () => {
      expect(cssParser(options, '.test { color: #F00 }'))
        .toEqual({
          type: 'stylesheet',
          stylesheet: {
            rules: [
              {
                type: 'rule',
                selectors: [
                  [
                    {
                      action: 'element',
                      ignoreCase: false,
                      name: 'class',
                      namespace: null,
                      original: '.test',
                      type: 'attribute',
                      value: 'test'
                    }
                  ]
                ],
                declarations: [
                  {
                    position: {
                      end: {
                        column: 21,
                        line: 1
                      },
                      source: undefined,
                      start: {
                        column: 9,
                        line: 1
                      }
                    },
                    property: 'color',
                    type: 'declaration',
                    value: '#F00'
                  }
                ],
                position: {
                  end: {
                    column: 22,
                    line: 1
                  },
                  source: undefined,
                  start: {
                    column: 1,
                    line: 1
                  }
                }
              }
            ],
            source: undefined,
            parsingErrors: []
          }
        });
    });
  });
});
