# Summary of applyReadConcern.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/schema/applyReadConcern.js`

## Content Preview
```
'use strict';

module.exports = function applyReadConcern(schema, options) {
  if (options.readConcern !== undefined) {
    return;
  }

  // Don't apply default read concern to operations in transactions,
  // because you shouldn't set read concern on individual operations
  // within a transaction.
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 575 characters
- Lines: 21
