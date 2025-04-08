# Summary of applyWriteConcern.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/schema/applyWriteConcern.js`

## Content Preview
```
'use strict';

module.exports = function applyWriteConcern(schema, options) {
  if (options.writeConcern != null) {
    return;
  }
  // Don't apply default write concern to operations in transactions,
  // because setting write concern on an operation in a transaction is an error
  // See: https://www.mongodb.com/docs/manual/reference/write-concern/
  if (options && options.session && options.session.transaction) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1257 characters
- Lines: 38
