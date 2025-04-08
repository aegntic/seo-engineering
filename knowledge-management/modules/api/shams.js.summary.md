# Summary of shams.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/has-symbols/shams.js`

## Content Preview
```
'use strict';

/** @type {import('./shams')} */
/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	/** @type {{ [k in symbol]?: unknown }} */
	var obj = {};
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1922 characters
- Lines: 46
