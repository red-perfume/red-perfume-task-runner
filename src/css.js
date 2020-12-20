const cssParser = require('./css-parser.js');
const cssStringify = require('./css-stringify.js');
const cssUglifier = require('./css-uglifier.js');
const encodeClassName = require('./class-encoding.js');

const css = function (options, input, uglify) {
  const parsed = cssParser(options, input);

  const output = {
    type: 'stylesheet',
    stylesheet: {
      rules: [],
      parsingErrors: []
    }
  };

  const classMap = {};
  const newRules = {};

  /* A rule looks like:
     {
       type: 'rule',
       selectors: [
         [
           {
             type: 'attribute',
             name: 'class',
             action: 'element',
             value: 'cow',
             ignoreCase: false,
             namespace: null,
             original: '.cow'
           }
         ]
       ],
       declarations: [
         {
           type: 'declaration',
           property: 'background',
           value: '#F00',
           position: {
             start: {
               line: 1,
               column: 8
             },
             end: {
               line: 1,
               column: 24
             }
           }
         },
         {
           type: 'declaration',
           property: 'border',
           value: 'none',
           position: {
             start: {
               line: 1,
               column: 26
             },
             end: {
               line: 1,
               column: 39
             }
           }
         }
       ],
       position: {
         start: {
           line: 1,
           column: 1
         },
         end: {
           line: 1,
           column: 40
         }
       }
     }
  */

  parsed.stylesheet.rules.forEach(function (rule) {
    /* A declaration looks like:
       {
         type: 'declaration',
         property: 'padding',
         value: '10px',
         position: Position {
           start: { line: 1, column: 48 },
           end: { line: 1, column: 61 },
           source: undefined
         }
       }
    */
    rule.declarations.forEach(function (declaration) {
      /* An encoded class name look like:
         .rp__padding__--COLON10px
      */
      let encodedClassName = encodeClassName(declaration);

      /* A selector looks like:
         [{
           type: 'attribute',
           name: 'class',
           action: 'element',
           value: 'cow',
           ignoreCase: false,
           namespace: null,
           original: '.cow'
          }]
        */
      rule.selectors.forEach(function (selector) {
        let originalSelectorName = selector[0].original;

        classMap[originalSelectorName] = classMap[originalSelectorName] || [];
        classMap[originalSelectorName].push(encodedClassName);
      });



      newRules[encodedClassName] = {
        type: 'rule',
        selectors: [[encodedClassName]],
        declarations: [declaration]
      };
    });
  });

  if (uglify) {
    let index = 0;
    Object.keys(newRules).forEach(function (key) {
      let result = cssUglifier(index);

      index = result.index;

      let uglifiedName = result.name;
      newRules[uglifiedName] = newRules[key];
      newRules[uglifiedName].selectors[0][0] = uglifiedName;
      delete newRules[key];

      Object.keys(classMap).forEach(function (mapKey) {
        let indexOfKey = classMap[mapKey].indexOf(key);
        if (indexOfKey !== -1) {
          classMap[mapKey][indexOfKey] = uglifiedName;
        }
      });
    });
  }

  Object.keys(newRules).forEach(function (key) {
    output.stylesheet.rules.push(newRules[key]);
  });

  return {
    // classMap: { '.cow': [ '.rp__0', '.rp__1' ], '.moo': [ '.rp__2', '.rp__1' ] }
    classMap,
    /*
      '.rp__0 { background: #F00; }' +
      '.rp__1 { border: none; }' +
      '.rp__2 { padding: 10px; }'
    */
    output: cssStringify(output)
  };
};

module.exports = css;
