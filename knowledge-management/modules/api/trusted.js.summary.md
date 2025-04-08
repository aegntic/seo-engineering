# Summary of trusted.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/query/trusted.js`

## Content Preview
```
'use strict';

const trustedSymbol = Symbol('mongoose#trustedSymbol');

exports.trustedSymbol = trustedSymbol;

exports.trusted = function trusted(obj) {
  if (obj == null || typeof obj !== 'object') {
    return obj;
  }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 268 characters
- Lines: 14
