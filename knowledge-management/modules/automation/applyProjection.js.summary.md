# Summary of applyProjection.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/projection/applyProjection.js`

## Content Preview
```
'use strict';

const hasIncludedChildren = require('./hasIncludedChildren');
const isExclusive = require('./isExclusive');
const isInclusive = require('./isInclusive');
const isPOJO = require('../../utils').isPOJO;

module.exports = function applyProjection(doc, projection, _hasIncludedChildren) {
  if (projection == null) {
    return doc;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2977 characters
- Lines: 84
