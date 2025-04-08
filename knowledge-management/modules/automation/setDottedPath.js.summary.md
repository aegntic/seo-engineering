# Summary of setDottedPath.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/path/setDottedPath.js`

## Content Preview
```
'use strict';

const specialProperties = require('../specialProperties');


module.exports = function setDottedPath(obj, path, val) {
  if (path.indexOf('.') === -1) {
    if (specialProperties.has(path)) {
      return;
    }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 585 characters
- Lines: 34
