# Summary of retry-agent.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/dispatcher/retry-agent.js`

## Content Preview
```
'use strict'

const Dispatcher = require('./dispatcher')
const RetryHandler = require('../handler/retry-handler')

class RetryAgent extends Dispatcher {
  #agent = null
  #options = null
  constructor (agent, options = {}) {
    super(options)
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 684 characters
- Lines: 36
