# Summary of parentPaths.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/path/parentPaths.js`

## Content Preview
```
'use strict';

const dotRE = /\./g;
module.exports = function parentPaths(path) {
  if (path.indexOf('.') === -1) {
    return [path];
  }
  const pieces = path.split(dotRE);
  const len = pieces.length;
  const ret = new Array(len);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 385 characters
- Lines: 19
