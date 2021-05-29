# Studio Related Tests

🎓 Run related tests with `lint-staged`.

> Runs a command with all tests for staged files named `${filename}.test.js`,
> `${filename}-test.js`, `${filename}_anything.test.js`,
> `${filename}-anything.test.js` or `${filename}.anything.test.js`.

## Setup

This assumes you have [husky][] and [lint-staged][] installed.

```bash
npm i @studio/related-tests -D
```

**lint-staged.config.js**

```js
const withRelatedTests = require('@studio/related-tests');

module.exports = {
  '*.js': withRelatedTests('mocha')
};
```

[husky]: https://github.com/typicode/husky
[lint-staged]: https://github.com/okonet/lint-staged
