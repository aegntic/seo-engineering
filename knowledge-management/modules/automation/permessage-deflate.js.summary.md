# Summary of permessage-deflate.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/web/websocket/permessage-deflate.js`

## Content Preview
```
'use strict'

const { createInflateRaw, Z_DEFAULT_WINDOWBITS } = require('node:zlib')
const { isValidClientWindowBits } = require('./util')

const tail = Buffer.from([0x00, 0x00, 0xff, 0xff])
const kBuffer = Symbol('kBuffer')
const kLength = Symbol('kLength')

class PerMessageDeflate {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1985 characters
- Lines: 71
