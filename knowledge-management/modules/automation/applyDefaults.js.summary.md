# Summary of applyDefaults.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/document/applyDefaults.js`

## Content Preview
```
'use strict';

const isNestedProjection = require('../projection/isNestedProjection');

module.exports = function applyDefaults(doc, fields, exclude, hasIncludedChildren, isBeforeSetters, pathsToSkip, options) {
  const paths = Object.keys(doc.$__schema.paths);
  const plen = paths.length;
  const skipParentChangeTracking = options && options.skipParentChangeTracking;

  for (let i = 0; i < plen; ++i) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3782 characters
- Lines: 133
