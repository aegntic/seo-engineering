# Summary of merge.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/schema/merge.js`

## Content Preview
```
'use strict';

module.exports = function merge(s1, s2, skipConflictingPaths) {
  const paths = Object.keys(s2.tree);
  const pathsToAdd = {};
  for (const key of paths) {
    if (skipConflictingPaths && (s1.paths[key] || s1.nested[key] || s1.singleNestedPaths[key])) {
      continue;
    }
    pathsToAdd[key] = s2.tree[key];
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 966 characters
- Lines: 37
