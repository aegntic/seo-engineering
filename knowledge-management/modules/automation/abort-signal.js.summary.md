# Summary of abort-signal.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/api/abort-signal.js`

## Content Preview
```
const { addAbortListener } = require('../core/util')
const { RequestAbortedError } = require('../core/errors')

const kListener = Symbol('kListener')
const kSignal = Symbol('kSignal')

function abort (self) {
  if (self.abort) {
    self.abort(self[kSignal]?.reason)
  } else {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1057 characters
- Lines: 58
