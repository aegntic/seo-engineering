# Summary of api-request.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/api/api-request.js`

## Content Preview
```
'use strict'

const assert = require('node:assert')
const { Readable } = require('./readable')
const { InvalidArgumentError, RequestAbortedError } = require('../core/errors')
const util = require('../core/util')
const { getResolveErrorBodyCallback } = require('./util')
const { AsyncResource } = require('node:async_hooks')

class RequestHandler extends AsyncResource {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 5734 characters
- Lines: 215
