# Summary of agent.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/dispatcher/agent.js`

## Content Preview
```
'use strict'

const { InvalidArgumentError } = require('../core/errors')
const { kClients, kRunning, kClose, kDestroy, kDispatch, kInterceptors } = require('../core/symbols')
const DispatcherBase = require('./dispatcher-base')
const Pool = require('./pool')
const Client = require('./client')
const util = require('../core/util')
const createRedirectInterceptor = require('../interceptor/redirect-interceptor')

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3999 characters
- Lines: 130
