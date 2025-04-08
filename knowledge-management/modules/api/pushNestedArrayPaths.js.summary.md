# Summary of pushNestedArrayPaths.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/model/pushNestedArrayPaths.js`

## Content Preview
```
'use strict';

module.exports = function pushNestedArrayPaths(paths, nestedArray, path) {
  if (nestedArray == null) {
    return;
  }

  for (let i = 0; i < nestedArray.length; ++i) {
    if (Array.isArray(nestedArray[i])) {
      pushNestedArrayPaths(paths, nestedArray[i], path + '.' + i);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 353 characters
- Lines: 16
