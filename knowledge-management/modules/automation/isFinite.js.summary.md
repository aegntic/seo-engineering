# Summary of isFinite.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/math-intrinsics/isFinite.js`

## Content Preview
```
'use strict';

var $isNaN = require('./isNaN');

/** @type {import('./isFinite')} */
module.exports = function isFinite(x) {
	return (typeof x === 'number' || typeof x === 'bigint')
        && !$isNaN(x)
        && x !== Infinity
        && x !== -Infinity;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 262 characters
- Lines: 13
