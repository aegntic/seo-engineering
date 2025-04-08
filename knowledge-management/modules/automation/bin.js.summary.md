# Summary of bin.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/rimraf/bin.js`

## Content Preview
```
#!/usr/bin/env node

const rimraf = require('./')

const path = require('path')

const isRoot = arg => /^(\/|[a-zA-Z]:\\)$/.test(path.resolve(arg))
const filterOutRoot = arg => {
  const ok = preserveRoot === false || !isRoot(arg)
  if (!ok) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1878 characters
- Lines: 69
