# Summary of ToObject.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/es-object-atoms/ToObject.js`

## Content Preview
```
'use strict';

var $Object = require('./');
var RequireObjectCoercible = require('./RequireObjectCoercible');

/** @type {import('./ToObject')} */
module.exports = function ToObject(value) {
	RequireObjectCoercible(value);
	return $Object(value);
};
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 250 characters
- Lines: 11
