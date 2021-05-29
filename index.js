'use strict';

const fs = require('fs/promises');

module.exports = withRelatedTests;

function withRelatedTests(command) {
  return async (files) => {
    const tests = await findTests(files);
    return tests.length ? `${command} ${tests.join(' ')}` : 'true';
  };
}

async function findTests(files) {
  const tests = new Set();
  for (const file of files) {
    if (file.endsWith('.test.js')) {
      tests.add(file);
      continue;
    }
    const test = file.replace(/\.js$/, '.test.js');
    try {
      await fs.access(test); // eslint-disable-line node/no-sync
    } catch (e) {
      continue;
    }
    tests.add(test);
  }
  return Array.from(tests);
}
