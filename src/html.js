'use strict';

/**
 * @file    Parse HTML to AST, replace classes with atomized versions, stringify back to HTML
 * @author  TheJaredWilcurt
 */

const parse5 = require('parse5');

const helpers = require('./helpers.js');

/**
 * Helper function used when you want to console.log(JSON.stringify(document)).
 *
 * @param  {object} document  An HTML AST
 * @return {object}           Modified AST
 */
function cleanDocument (document) {
  /**
   * Parent nodes are circular and don't allow you to JSON.stringify.
   * This function removes them.
   *
   * @param  {object}    node  A node in the HTML AST
   * @return {undefined}       Does not return anything, just mutates the object
   */
  function removeParentNodes (node) {
    delete node.parentNode;
    delete node.namespaceURI;
    // Coverage ignored because this function is only used during development.
    /* istanbul ignore next */
    if (node.childNodes) {
      /* istanbul ignore next */
      node.childNodes.forEach(function (child) {
        /* istanbul ignore next */
        removeParentNodes(child);
      });
    }
  }
  removeParentNodes(document);

  return document;
}

/**
 * Replaces all instances of a class name in class attributes in the DOM
 * with its atomized representation of class names.
 *
 * @param  {object}    node            An HTML node as AST
 * @param  {string}    classToReplace  A string to find and replace
 * @param  {Array}     newClasses      Array of strings that will replace the given class
 * @return {undefined}                 Just mutates the AST. Nothing returned
 */
function replaceSemanticClassWithAtomizedClasses (node, classToReplace, newClasses) {
  /* An example of a Node:
    {
      nodeName: 'h1',
      tagName: 'h1',
      attrs: [
        {
          name: 'class',
          value: 'cool cat nice wow'
        }
      ],
      namespaceURI: 'http://www.w3.org/1999/xhtml',
      childNodes: [
        {
          nodeName: '#text',
          value: '\n                  Meow\n                '
        }
      ]
    }
  */
  if (node.attrs) {
    node.attrs.forEach(function (attribute) {
      if (attribute.name === 'class') {
        // 'cool cat nice wow' => ['cool','cat','nice','wow']
        let classes = attribute.value.split(' ');
        if (classes.includes(classToReplace)) {
          // ['cool','cat','nice','wow'] => ['cool','nice','wow']
          classes = classes.filter(function (className) {
            return className !== classToReplace;
          });
          // ['cool','cat','nice','wow','rp__4','rp__8']
          classes = [
            ...classes,
            ...newClasses
          ];
          // 'cool cat nice wow rp__4 rp__8'
          attribute.value = classes.join(' ');
        }
      }
    });
  }
  if (node.childNodes) {
    node.childNodes.forEach(function (child) {
      replaceSemanticClassWithAtomizedClasses(child, classToReplace, newClasses);
    });
  }
}

/**
 * Minifies a given markup string based on options.
 *
 * @param  {object} options       Options object from user containing verbose/customLogger
 * @param  {string} markup        The string of HTML to minify
 * @param  {object} minify        Options for HTML-Minifier-Terser
 * @param  {Array}  markupErrors  Array of error messages
 * @return {string}               Minified markup
 */
async function minifyMarkup (options, markup, minify, markupErrors) {
  const minifyOptions = {
    caseSensitive: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    html5: true,
    includeAutoGeneratedTags: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
    ...minify
  };
  const minifier = require('html-minifier-terser').minify;
  return await minifier(markup, minifyOptions)
    .then((output) => {
      return output;
    })
    .catch((err) => {
      const message = 'Error minifying HTML';
      markupErrors.push(message);
      helpers.throwError(options, message, err);
    });
}

/**
 * Parse an HTML string.
 * Replace the original classnames with the atomized versions.
 * Reserialize HTML to string.
 *
 * @param  {object} options       Options object from user containing verbose/customLogger
 * @param  {string} input         String of valid HTML
 * @param  {object} classMap      Map generated by css.js containing class names as the key with array of atomized style class name strings as the value
 * @param  {Array}  markupErrors  Array of error messages
 * @param  {object} minify        The minify options
 * @return {string}               String of HTML with the class names replaced
 */
const html = async function (options, input, classMap, markupErrors, minify) {
  options = options || {};
  input = input || '';
  classMap = classMap || {};
  markupErrors = markupErrors || [];

  // TODO: cleanDocument() only needed for cleaner console logs, could be removed later for performance boost
  // String => AST Object.
  const document = cleanDocument(parse5.parse(input));

  Object.keys(classMap).forEach(function (semanticClass) {
    let atomizedClasses = classMap[semanticClass];
    atomizedClasses = atomizedClasses.map(function (atomic) {
      return atomic.replace('.', '');
    });
    if (semanticClass.startsWith('.')) {
      semanticClass = semanticClass.replace('.', '');
    }
    replaceSemanticClassWithAtomizedClasses(document, semanticClass, atomizedClasses);
  });

  // Object => string
  let atomizedHtml = parse5.serialize(document);

  if (!atomizedHtml || atomizedHtml === '<html><head></head><body></body></html>') {
    const message = 'Error parsing HTML';
    markupErrors.push(message);
    helpers.throwError(options, message, (atomizedHtml || document));
  }

  if (minify) {
    atomizedHtml = await minifyMarkup(options, atomizedHtml, minify, markupErrors);
  }

  return atomizedHtml;
};

module.exports = html;
