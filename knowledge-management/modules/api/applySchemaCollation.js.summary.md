# Summary of applySchemaCollation.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/indexes/applySchemaCollation.js`

## Content Preview
```
'use strict';

const isTextIndex = require('./isTextIndex');

module.exports = function applySchemaCollation(indexKeys, indexOptions, schemaOptions) {
  if (isTextIndex(indexKeys)) {
    return;
  }

  if (schemaOptions.hasOwnProperty('collation') && !indexOptions.hasOwnProperty('collation')) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 357 characters
- Lines: 14
