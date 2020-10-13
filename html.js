const parse5 = require('parse5');

function cleanDocument (document) {
  // Parent nodes are circular and don't allow you to JSON.stringify
  function removeParentNodes (node) {
    delete node.parentNode;
    if (node.childNodes) {
      node.childNodes.forEach(function (child) {
        removeParentNodes(child);
      });
    }
  }
  removeParentNodes(document);

  return document;
}

const html = function (input, processedStyles) {
  // String => Object
  const document = parse5.parse(input);

  function removeEveryInstance (arr, value) {
    let i = 0;
    while (i < arr.length) {
      if (arr[i] === value) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return arr;
  }

  function replaceSemanticClassWithAtomizedClasses (node, classToReplace, arrayOfNewClasses) {
    if (node.attrs) {
      node.attrs.forEach(function (attribute) {
        if (attribute.name === 'class') {
          let classes = attribute.value.split(' ');
          if (classes.includes(classToReplace)) {
            classes = removeEveryInstance(classes, classToReplace);
            classes.push(...arrayOfNewClasses);
          }
          attribute.value = classes.join(' ');
        }
      });
    }
    if (node.childNodes) {
      node.childNodes.forEach(function (child) {
        replaceSemanticClassWithAtomizedClasses(child, classToReplace, arrayOfNewClasses);
      });
    }
  }

  Object.keys(processedStyles.classMap).forEach(function (semanticClass) {
    let atomizedClasses = processedStyles.classMap[semanticClass];
    atomizedClasses = atomizedClasses.map(function (atomic) {
      return atomic.replace('.', '');
    });
    if (semanticClass.startsWith('.')) {
      semanticClass = semanticClass.replace('.', '');
    }
    replaceSemanticClassWithAtomizedClasses(document, semanticClass, atomizedClasses);
  });

  // Object => string
  return parse5.serialize(document);
}

module.exports = html;
