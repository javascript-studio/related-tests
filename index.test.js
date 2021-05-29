'use strict';

const fs = require('fs/promises');
const { assert, sinon } = require('@sinonjs/referee-sinon');
const withRelatedTests = require('.');

describe('withRelatedTests', () => {
  const noop = 'true';
  const command = 'mocha -R dot';
  const lintStaged = withRelatedTests(command);

  afterEach(() => {
    sinon.restore();
  });

  it('returns noop for empty file list', async () => {
    const script = await lintStaged([]);

    assert.equals(script, noop);
  });

  it('returns file ending with .test.js', async () => {
    const script = await lintStaged(['some.test.js']);

    assert.equals(script, `${command} some.test.js`);
  });

  it('returns matching tests if they exist', async () => {
    sinon.replace(fs, 'access', sinon.fake.resolves());

    const script = await lintStaged(['foo.js', 'bar.js']);

    assert.equals(script, `${command} foo.test.js bar.test.js`);
  });

  it('does not return matching test they do not exist', async () => {
    sinon.replace(fs, 'access', sinon.fake.rejects(new Error()));

    const script = await lintStaged(['foo.js', 'bar.js']);

    assert.equals(script, noop);
  });

  it('returns file and matching test only once', async () => {
    sinon.replace(fs, 'access', sinon.fake.resolves());

    const script = await lintStaged([
      'foo.js',
      'bar.js',
      'foo.test.js',
      'bar.test.js'
    ]);

    assert.equals(script, `${command} foo.test.js bar.test.js`);
  });
});
