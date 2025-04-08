# Summary of RequireObjectCoercible.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/es-object-atoms/RequireObjectCoercible.js`

## Content Preview
```
'use strict';

var $TypeError = require('es-errors/type');

/** @type {import('./RequireObjectCoercible')} */
module.exports = function RequireObjectCoercible(value) {
	if (value == null) {
		throw new $TypeError((arguments.length > 0 && arguments[1]) || ('Cannot call method on ' + value));
	}
	return value;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 313 characters
- Lines: 12
