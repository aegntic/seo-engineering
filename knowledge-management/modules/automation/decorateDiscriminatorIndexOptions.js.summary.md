# Summary of decorateDiscriminatorIndexOptions.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/indexes/decorateDiscriminatorIndexOptions.js`

## Content Preview
```
'use strict';

module.exports = function decorateDiscriminatorIndexOptions(schema, indexOptions) {
  // If the model is a discriminator and has an index, add a
  // partialFilterExpression by default so the index will only apply
  // to that discriminator.
  const discriminatorName = schema.discriminatorMapping && schema.discriminatorMapping.value;
  if (discriminatorName && !('sparse' in indexOptions)) {
    const discriminatorKey = schema.options.discriminatorKey;
    indexOptions.partialFilterExpression = indexOptions.partialFilterExpression || {};
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 668 characters
- Lines: 15
