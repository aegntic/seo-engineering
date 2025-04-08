# Summary of getRelatedIndexes.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/indexes/getRelatedIndexes.js`

## Content Preview
```
'use strict';

const hasDollarKeys = require('../query/hasDollarKeys');

function getRelatedSchemaIndexes(model, schemaIndexes) {
  return getRelatedIndexes({
    baseModelName: model.baseModelName,
    discriminatorMapping: model.schema.discriminatorMapping,
    indexes: schemaIndexes,
    indexesType: 'schema'
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1842 characters
- Lines: 64
