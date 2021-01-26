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
  files.forEach((file) => {
    if (file.endsWith('.test.js')) {
      tests.add(file);
      return;
    }
    const test = file.replace(/\.js$/, '.test.js');
    try {
      fs.accessSync(test); // eslint-disable-line node/no-sync
    } catch (e) {
      return;
    }
    tests.add(test);
  });
  return Array.from(tests);
}
