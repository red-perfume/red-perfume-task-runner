function incrementUglifier (uglifierIndex) {
  uglifierIndex = uglifierIndex + 1;
  let knownBad = [
     'ad' // adblockers may hide these elements
  ];
  function containsBad (value) {
    return uglifierIndex.toString(36).includes(value);
  }
  while (knownBad.some(containsBad)) {
    uglifierIndex = uglifierIndex + 1;
  }
  return uglifierIndex
}

function cssUglifier (uglifierIndex) {
  uglifierIndex = uglifierIndex || 0;
  if (typeof(uglifierIndex) !== 'number') {
    uglifierIndex = 0;
  }
  uglifierIndex = Math.round(uglifierIndex);

  return {
    name: '.rp__' + uglifierIndex.toString(36),
    index: incrementUglifier(uglifierIndex)
  };
}

module.exports = cssUglifier;
