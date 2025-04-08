# Summary of pool-base.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/dispatcher/pool-base.js`

## Content Preview
```
'use strict'

const DispatcherBase = require('./dispatcher-base')
const FixedQueue = require('./fixed-queue')
const { kConnected, kSize, kRunning, kPending, kQueued, kBusy, kFree, kUrl, kClose, kDestroy, kDispatch } = require('../core/symbols')
const PoolStats = require('./pool-stats')

const kClients = Symbol('clients')
const kNeedDrain = Symbol('needDrain')
const kQueue = Symbol('queue')
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 4550 characters
- Lines: 195
