# Summary of register-env.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/lib/register-env.js`

## Content Preview
```
'use strict'

const processOnSpawn = require('process-on-spawn')

const envToCopy = {}

processOnSpawn.addListener(({ env }) => {
  Object.assign(env, envToCopy)
})

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 487 characters
- Lines: 28
