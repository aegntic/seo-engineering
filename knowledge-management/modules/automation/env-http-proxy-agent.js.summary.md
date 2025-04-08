# Summary of env-http-proxy-agent.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/dispatcher/env-http-proxy-agent.js`

## Content Preview
```
'use strict'

const DispatcherBase = require('./dispatcher-base')
const { kClose, kDestroy, kClosed, kDestroyed, kDispatch, kNoProxyAgent, kHttpProxyAgent, kHttpsProxyAgent } = require('../core/symbols')
const ProxyAgent = require('./proxy-agent')
const Agent = require('./agent')

const DEFAULT_PORTS = {
  'http:': 80,
  'https:': 443
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 4479 characters
- Lines: 161
