# Summary of eventsource.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/web/eventsource/eventsource.js`

## Content Preview
```
'use strict'

const { pipeline } = require('node:stream')
const { fetching } = require('../fetch')
const { makeRequest } = require('../fetch/request')
const { webidl } = require('../fetch/webidl')
const { EventSourceStream } = require('./eventsource-stream')
const { parseMIMEType } = require('../fetch/data-url')
const { createFastMessageEvent } = require('../websocket/events')
const { isNetworkError } = require('../fetch/response')
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 14143 characters
- Lines: 481
