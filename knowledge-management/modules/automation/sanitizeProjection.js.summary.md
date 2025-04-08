# Summary of sanitizeProjection.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/query/sanitizeProjection.js`

## Content Preview
```
'use strict';

module.exports = function sanitizeProjection(projection) {
  if (projection == null) {
    return;
  }

  const keys = Object.keys(projection);
  for (let i = 0; i < keys.length; ++i) {
    if (typeof projection[keys[i]] === 'string') {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 296 characters
- Lines: 15
