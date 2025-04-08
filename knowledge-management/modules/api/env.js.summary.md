# Summary of env.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mquery/lib/env.js`

## Content Preview
```
'use strict';

exports.isNode = 'undefined' != typeof process
           && 'object' == typeof module
           && 'object' == typeof global
           && 'function' == typeof Buffer
           && process.argv;

exports.isMongo = !exports.isNode
           && 'function' == typeof printjson
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 662 characters
- Lines: 23
