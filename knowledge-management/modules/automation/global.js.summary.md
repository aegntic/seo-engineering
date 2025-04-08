# Summary of global.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/web/fetch/global.js`

## Content Preview
```
'use strict'

// In case of breaking changes, increase the version
// number to avoid conflicts.
const globalOrigin = Symbol.for('undici.globalOrigin.1')

function getGlobalOrigin () {
  return globalThis[globalOrigin]
}

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 890 characters
- Lines: 41
