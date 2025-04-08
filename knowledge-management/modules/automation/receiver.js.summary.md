# Summary of receiver.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/web/websocket/receiver.js`

## Content Preview
```
'use strict'

const { Writable } = require('node:stream')
const assert = require('node:assert')
const { parserStates, opcodes, states, emptyBuffer, sentCloseFrameState } = require('./constants')
const { kReadyState, kSentClose, kResponse, kReceivedClose } = require('./symbols')
const { channels } = require('../../core/diagnostics')
const {
  isValidStatusCode,
  isValidOpcode,
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 13659 characters
- Lines: 425
