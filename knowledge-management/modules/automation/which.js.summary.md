# Summary of which.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/which/which.js`

## Content Preview
```
const isWindows = process.platform === 'win32' ||
    process.env.OSTYPE === 'cygwin' ||
    process.env.OSTYPE === 'msys'

const path = require('path')
const COLON = isWindows ? ';' : ':'
const isexe = require('isexe')

const getNotFoundError = (cmd) =>
  Object.assign(new Error(`not found: ${cmd}`), { code: 'ENOENT' })
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3163 characters
- Lines: 126
