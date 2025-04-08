# Summary of isDefaultIdIndex.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/indexes/isDefaultIdIndex.js`

## Content Preview
```
'use strict';

const get = require('../get');

module.exports = function isDefaultIdIndex(index) {
  if (Array.isArray(index)) {
    // Mongoose syntax
    const keys = Object.keys(index[0]);
    return keys.length === 1 && keys[0] === '_id' && index[0]._id !== 'hashed';
  }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 444 characters
- Lines: 19
