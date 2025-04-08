# Summary of pool-stats.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/dispatcher/pool-stats.js`

## Content Preview
```
const { kFree, kConnected, kPending, kQueued, kRunning, kSize } = require('../core/symbols')
const kPool = Symbol('pool')

class PoolStats {
  constructor (pool) {
    this[kPool] = pool
  }

  get connected () {
    return this[kPool][kConnected]
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 553 characters
- Lines: 35
