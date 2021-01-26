'use strict';

const fs = require('fs');
const { assert, sinon } = require('@sinonjs/referee-sinon');
const withRelatedTests = require('.');

describe('withRelatedTests', () => {
  const noop = 'true';
  const command = 'mocha -R dot';
  const lintStaged = withRelatedTests(command);

  afterEach(() => {
    sinon.restore();
  });

  it('returns noop for empty file list', () => {
    const script = lintStaged([]);

    assert.equals(script, noop);
  });

  it('returns file ending with .test.js', () => {
    const script = lintStaged(['some.test.js']);

    assert.equals(script, `${command} some.test.js`);
  });

  it('returns matching tests if they exist', () => {
    sinon.replace(fs, 'accessSync', sinon.fake());

    const script = lintStaged(['foo.js', 'bar.js']);

    assert.equals(script, `${command} foo.test.js bar.test.js`);
  });

  it('does not return matching test they do not exist', () => {
    sinon.replace(fs, 'accessSync', sinon.fake.throws(new Error()));

    const script = lintStaged(['foo.js', 'bar.js']);

    assert.equals(script, noop);
  });

  it('returns file and matching test only once', () => {
    sinon.replace(fs, 'accessSync', sinon.fake());

    const script = lintStaged([
      'foo.js',
      'bar.js',
      'foo.test.js',
      'bar.test.js'
    ]);

    assert.equals(script, `${command} foo.test.js bar.test.js`);
  });
});
