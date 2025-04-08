# Summary of mock-errors.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/mock/mock-errors.js`

## Content Preview
```
'use strict'

const { UndiciError } = require('../core/errors')

class MockNotMatchedError extends UndiciError {
  constructor (message) {
    super(message)
    Error.captureStackTrace(this, MockNotMatchedError)
    this.name = 'MockNotMatchedError'
    this.message = message || 'The request does not match any registered mock dispatches'
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 439 characters
- Lines: 18
