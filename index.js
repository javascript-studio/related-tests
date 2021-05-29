'use strict';

const fs = require('fs');

module.exports = withRelatedTests;

function withRelatedTests(command) {
  return (files) => {
    const tests = findTests(files);
    return tests.length ? `${command} ${tests.join(' ')}` : 'true';
  };
}

function findTests(files) {
  const tests = new Set();
  for (const file of files) {
    if (file.endsWith('.test.js')) {
      tests.add(file);
      continue;
    }
    const test = file.replace(/\.js$/, '.test.js');
    try {
      fs.accessSync(test); // eslint-disable-line node/no-sync
    } catch (e) {
      continue;
    }
    tests.add(test);
  }
  return Array.from(tests);
}
