# Summary of api-upgrade.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/api/api-upgrade.js`

## Content Preview
```
'use strict'

const { InvalidArgumentError, SocketError } = require('../core/errors')
const { AsyncResource } = require('node:async_hooks')
const util = require('../core/util')
const { addSignal, removeSignal } = require('./abort-signal')
const assert = require('node:assert')

class UpgradeHandler extends AsyncResource {
  constructor (opts, callback) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2576 characters
- Lines: 109
