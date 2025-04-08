# Summary of chownr.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/chownr/chownr.js`

## Content Preview
```
'use strict'
const fs = require('fs')
const path = require('path')

/* istanbul ignore next */
const LCHOWN = fs.lchown ? 'lchown' : 'chown'
/* istanbul ignore next */
const LCHOWNSYNC = fs.lchownSync ? 'lchownSync' : 'chownSync'

/* istanbul ignore next */
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 4275 characters
- Lines: 168
