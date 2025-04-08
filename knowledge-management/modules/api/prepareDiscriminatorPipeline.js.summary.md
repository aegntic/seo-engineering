# Summary of prepareDiscriminatorPipeline.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/aggregate/prepareDiscriminatorPipeline.js`

## Content Preview
```
'use strict';

module.exports = function prepareDiscriminatorPipeline(pipeline, schema, prefix) {
  const discriminatorMapping = schema && schema.discriminatorMapping;
  prefix = prefix || '';

  if (discriminatorMapping && !discriminatorMapping.isRoot) {
    const originalPipeline = pipeline;
    const filterKey = (prefix.length > 0 ? prefix + '.' : prefix) + discriminatorMapping.key;
    const discriminatorValue = discriminatorMapping.value;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1858 characters
- Lines: 40
