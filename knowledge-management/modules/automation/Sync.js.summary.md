# Summary of Sync.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/release-zalgo/lib/Sync.js`

## Content Preview
```
'use strict'

const Thenable = require('./Thenable')
const unwrapSync = require('./unwrapSync')

class Sync {
  run (executors) {
    const args = Array.from(arguments).slice(1)
    return new Thenable(() => executors.sync.apply(null, args))
  }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 491 characters
- Lines: 25
