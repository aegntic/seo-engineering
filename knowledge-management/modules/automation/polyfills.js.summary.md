# Summary of polyfills.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/graceful-fs/polyfills.js`

## Content Preview
```
var constants = require('constants')

var origCwd = process.cwd
var cwd = null

var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform

process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process)
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 10141 characters
- Lines: 356
