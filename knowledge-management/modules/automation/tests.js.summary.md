# Summary of tests.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/has-symbols/test/tests.js`

## Content Preview
```
'use strict';

/** @type {(t: import('tape').Test) => false | void} */
// eslint-disable-next-line consistent-return
module.exports = function runSymbolTests(t) {
	t.equal(typeof Symbol, 'function', 'global Symbol is a function');

	if (typeof Symbol !== 'function') { return false; }

	t.notEqual(Symbol(), Symbol(), 'two symbols are not equal');
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2139 characters
- Lines: 59
