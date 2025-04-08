# Summary of mod.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/math-intrinsics/mod.js`

## Content Preview
```
'use strict';

var $floor = require('./floor');

/** @type {import('./mod')} */
module.exports = function mod(number, modulo) {
	var remain = number % modulo;
	return $floor(remain >= 0 ? remain : remain + modulo);
};

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 218 characters
- Lines: 10
