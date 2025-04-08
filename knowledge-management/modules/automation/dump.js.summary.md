# Summary of dump.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/interceptor/dump.js`

## Content Preview
```
'use strict'

const util = require('../core/util')
const { InvalidArgumentError, RequestAbortedError } = require('../core/errors')
const DecoratorHandler = require('../handler/decorator-handler')

class DumpHandler extends DecoratorHandler {
  #maxSize = 1024 * 1024
  #abort = null
  #dumped = false
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2514 characters
- Lines: 124
