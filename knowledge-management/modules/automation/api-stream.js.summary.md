# Summary of api-stream.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/api/api-stream.js`

## Content Preview
```
'use strict'

const assert = require('node:assert')
const { finished, PassThrough } = require('node:stream')
const { InvalidArgumentError, InvalidReturnValueError } = require('../core/errors')
const util = require('../core/util')
const { getResolveErrorBodyCallback } = require('./util')
const { AsyncResource } = require('node:async_hooks')
const { addSignal, removeSignal } = require('./abort-signal')

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 5320 characters
- Lines: 221
