# Summary of opts-arg.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mkdirp/lib/opts-arg.js`

## Content Preview
```
const { promisify } = require('util')
const fs = require('fs')
const optsArg = opts => {
  if (!opts)
    opts = { mode: 0o777, fs }
  else if (typeof opts === 'object')
    opts = { mode: 0o777, fs, ...opts }
  else if (typeof opts === 'number')
    opts = { mode: opts, fs }
  else if (typeof opts === 'string')
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 784 characters
- Lines: 24
