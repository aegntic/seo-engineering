# Summary of unwrapSync.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/release-zalgo/lib/unwrapSync.js`

## Content Preview
```
'use strict'

const ExtendableError = require('es6-error')

const constants = require('./constants')

class UnwrapError extends ExtendableError {
  constructor (thenable) {
    super('Could not unwrap asynchronous thenable')
    this.thenable = thenable
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1206 characters
- Lines: 55
