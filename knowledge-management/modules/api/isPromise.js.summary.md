# Summary of isPromise.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/isPromise.js`

## Content Preview
```
'use strict';
function isPromise(val) {
  return !!val && (typeof val === 'object' || typeof val === 'function') && typeof val.then === 'function';
}

module.exports = isPromise;

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 179 characters
- Lines: 7
