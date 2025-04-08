# Summary of exe-type.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/spawn-wrap/lib/exe-type.js`

## Content Preview
```
'use strict';

const isWindows = require("is-windows")
const path = require("path")

function isCmd(file) {
  const comspec = path.basename(process.env.comspec || '').replace(/\.exe$/i, '')
  return isWindows() && (file === comspec || /^cmd(?:\.exe)?$/i.test(file))
}

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1399 characters
- Lines: 54
