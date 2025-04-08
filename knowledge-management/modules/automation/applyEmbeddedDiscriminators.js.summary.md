# Summary of applyEmbeddedDiscriminators.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/discriminator/applyEmbeddedDiscriminators.js`

## Content Preview
```
'use strict';

module.exports = applyEmbeddedDiscriminators;

function applyEmbeddedDiscriminators(schema, seen = new WeakSet(), overwriteExisting = false) {
  if (seen.has(schema)) {
    return;
  }
  seen.add(schema);
  for (const path of Object.keys(schema.paths)) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1102 characters
- Lines: 37
