'use strict';

const fs = require('fs/promises');
const { assert, refute, sinon } = require('@sinonjs/referee-sinon');
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
    sinon.replace(fs, 'readdir', sinon.fake.resolves(['some.test.js']));

    const script = await lintStaged(['some.test.js']);

    assert.equals(script, `${command} some.test.js`);
  });

  it('returns matching .test.js files if they exist', async () => {
    sinon.replace(
      fs,
      'readdir',
      sinon.fake.resolves(['foo.js', 'foo.test.js', 'bar.js', 'bar.test.js'])
    );

    const script = await lintStaged(['foo.js', 'bar.js']);

    assert.equals(script, `${command} foo.test.js bar.test.js`);
  });

  it('does not return matching test they do not exist', async () => {
    sinon.replace(fs, 'readdir', sinon.fake.resolves(['foo.js', 'bar.js']));

    const script = await lintStaged(['foo.js', 'bar.js']);

    assert.equals(script, noop);
  });

  it('returns file and matching test only once', async () => {
    sinon.replace(
      fs,
      'readdir',
      sinon.fake.resolves(['foo.js', 'foo.test.js', 'bar.js', 'bar.test.js'])
    );

    const script = await lintStaged([
      'foo.js',
      'bar.js',
      'foo.test.js',
      'bar.test.js'
    ]);

    assert.equals(script, `${command} foo.test.js bar.test.js`);
  });

  it('does not call fs.readdir for .test.js files', async () => {
    sinon.replace(fs, 'readdir', sinon.fake.rejects(new Error('Unexpected')));

    await lintStaged(['a.test.js', 'foo/b.test.js']);

    refute.called(fs.readdir);
  });

  it('only calls fs.readdir once per directory', async () => {
    sinon.replace(fs, 'readdir', sinon.fake.resolves([]));

    const script = await lintStaged([
      'foo/a.js',
      'foo/b.js',
      'bar/c.js',
      'bar/d.js',
      'bar/e.js'
    ]);

    assert.calledTwice(fs.readdir);
    assert.calledWith(fs.readdir, 'foo');
    assert.calledWith(fs.readdir, 'bar');
    assert.equals(script, 'true');
  });

  it('only adds matching files in same directory', async () => {
    sinon.replace(
      fs,
      'readdir',
      sinon.fake((dir) => {
        switch (dir) {
          case 'foo':
            return Promise.resolve(['file.test.js']);
          case 'bar':
            return Promise.resolve(['other.test.js']);
          default:
            throw new Error(`Unexpected dir "${dir}"`);
        }
      })
    );

    const script = await lintStaged(['foo/file.js', 'bar/file.js']);

    assert.equals(script, `${command} foo/file.test.js`);
  });
});
