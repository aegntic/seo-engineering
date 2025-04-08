# Summary of isTextIndex.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/indexes/isTextIndex.js`

## Content Preview
```
'use strict';

/**
 * Returns `true` if the given index options have a `text` option.
 */

module.exports = function isTextIndex(indexKeys) {
  let isTextIndex = false;
  for (const key of Object.keys(indexKeys)) {
    if (indexKeys[key] === 'text') {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 314 characters
- Lines: 17
