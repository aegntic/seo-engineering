# Summary of idGetter.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/schema/idGetter.js`

## Content Preview
```
'use strict';

/*!
 * ignore
 */

module.exports = function addIdGetter(schema) {
  // ensure the documents receive an id getter unless disabled
  const autoIdGetter = !schema.paths['id'] &&
    schema.paths['_id'] &&
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 590 characters
- Lines: 35
