# Summary of isPOJO.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/isPOJO.js`

## Content Preview
```
'use strict';

module.exports = function isPOJO(arg) {
  if (arg == null || typeof arg !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(arg);
  // Prototype may be null if you used `Object.create(null)`
  // Checking `proto`'s constructor is safe because `getPrototypeOf()`
  // explicitly crosses the boundary from object data to object metadata
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 433 characters
- Lines: 13
