'use strict';

const withRelatedTests = require('.');

module.exports = {
  '*.js': ['eslint --fix', withRelatedTests('mocha')],
  '*.{js,md}': 'prettier --write'
};
