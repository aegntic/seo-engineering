# Summary of Async.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/release-zalgo/lib/Async.js`

## Content Preview
```
'use strict'

class Async {
  run (executors) {
    const args = Array.from(arguments).slice(1)
    return new Promise(resolve => resolve(executors.async.apply(null, args)))
  }

  all (arr) {
    return Promise.all(arr)
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 368 characters
- Lines: 22
