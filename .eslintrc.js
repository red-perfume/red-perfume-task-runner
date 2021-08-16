module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017
  },
  env: {
    'es6': true,
    'node': true,
    'jest': true
  },
  extends: [
    'tjw-base',
    'tjw-jest',
    'tjw-jsdoc'
  ],
  rules: {
    'jsdoc/require-example': 'off'
  }
};
