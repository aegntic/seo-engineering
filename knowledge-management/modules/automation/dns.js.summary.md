# Summary of dns.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/interceptor/dns.js`

## Content Preview
```
'use strict'
const { isIP } = require('node:net')
const { lookup } = require('node:dns')
const DecoratorHandler = require('../handler/decorator-handler')
const { InvalidArgumentError, InformationalError } = require('../core/errors')
const maxInt = Math.pow(2, 31) - 1

class DNSInstance {
  #maxTTL = 0
  #maxItems = 0
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 9338 characters
- Lines: 376
