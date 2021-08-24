'use strict';

/**
 * @file    Defines shared constant variables
 * @author  TheJaredWilcurt
 */

const IMPRESSED_MESSAGE = 'A rule declaration was missing details, ' +
  'such as property or value. This may result in a classname like ' +
  '.rp__width__--COLONundefined, .rp__undefined__--COLON100px, or ' +
  '.rp__undefined__--COLONundefined. If there are multiples of ' +
  'these, they may replace the previous. Please report this error ' +
  'to github.com/red-perfume/red-perfume/issues because I have no ' +
  'idea how to reproduce it with actual CSS input. This was just ' +
  'meant for a safety check. Honestly, if you actually got this ' +
  'error, I\'m kind of impressed.';

module.exports = {
  IMPRESSED_MESSAGE
};
