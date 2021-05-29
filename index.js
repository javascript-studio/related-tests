'use strict';

const path = require('path');
const fs = require('fs/promises');

module.exports = withRelatedTests;

function withRelatedTests(command) {
  return async (files) => {
    const tests = await findTests(files);
    return tests.length ? `${command} ${tests.join(' ')}` : 'true';
  };
}

const separators = {
  '.': true,
  '-': true,
  _: true
};

async function findTests(files) {
  const tests = new Set();
  const dirs_to_files = new Map();

  for (const file of files) {
    if (isTestFile(file)) {
      tests.add(file);
      // Already matching, no need to read the directory
      continue;
    }
    // Map directories to file basename:
    const dir = path.dirname(file);
    if (!dirs_to_files.has(dir)) {
      dirs_to_files.set(dir, []);
    }
    dirs_to_files.get(dir).push(path.basename(file, '.js'));
  }

  // Read files in each directory:
  for (const [dir, files_in_dir] of dirs_to_files.entries()) {
    const dir_files = await fs.readdir(dir);
    // Add matching tests:
    for (const dir_file of dir_files) {
      for (const file_in_dir of files_in_dir) {
        if (
          dir_file.startsWith(file_in_dir) &&
          separators[dir_file[file_in_dir.length]] &&
          isTestFile(dir_file)
        ) {
          tests.add(path.join(dir, dir_file));
        }
      }
    }
  }
  return Array.from(tests);
}

function isTestFile(file) {
  return file.endsWith('.test.js') || file.endsWith('-test.js');
}
