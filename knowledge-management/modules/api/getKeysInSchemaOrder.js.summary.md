# Summary of getKeysInSchemaOrder.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/schema/getKeysInSchemaOrder.js`

## Content Preview
```
'use strict';

const get = require('../get');

module.exports = function getKeysInSchemaOrder(schema, val, path) {
  const schemaKeys = path != null ? Object.keys(get(schema.tree, path, {})) : Object.keys(schema.tree);
  const valKeys = new Set(Object.keys(val));

  let keys;
  if (valKeys.size > 1) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 621 characters
- Lines: 29
