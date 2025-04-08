# Summary of enoent.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cross-spawn/lib/enoent.js`

## Content Preview
```
'use strict';

const isWin = process.platform === 'win32';

function notFoundError(original, syscall) {
    return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
        code: 'ENOENT',
        errno: 'ENOENT',
        syscall: `${syscall} ${original.command}`,
        path: original.command,
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1471 characters
- Lines: 60
