# Summary of arrayDepth.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/arrayDepth.js`

## Content Preview
```
'use strict';

module.exports = arrayDepth;

function arrayDepth(arr) {
  if (!Array.isArray(arr)) {
    return { min: 0, max: 0, containsNonArrayItem: true };
  }
  if (arr.length === 0) {
    return { min: 1, max: 1, containsNonArrayItem: false };
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 766 characters
- Lines: 34
