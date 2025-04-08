# Summary of read-entry.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/tar/lib/read-entry.js`

## Content Preview
```
'use strict'
const { Minipass } = require('minipass')
const normPath = require('./normalize-windows-path.js')

const SLURP = Symbol('slurp')
module.exports = class ReadEntry extends Minipass {
  constructor (header, ex, gex) {
    super()
    // read entries always start life paused.  this is to avoid the
    // situation where Minipass's auto-ending empty streams results
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2842 characters
- Lines: 108
