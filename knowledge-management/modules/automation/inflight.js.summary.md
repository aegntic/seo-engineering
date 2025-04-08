# Summary of inflight.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/inflight/inflight.js`

## Content Preview
```
var wrappy = require('wrappy')
var reqs = Object.create(null)
var once = require('once')

module.exports = wrappy(inflight)

function inflight (key, cb) {
  if (reqs[key]) {
    reqs[key].push(cb)
    return null
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1365 characters
- Lines: 55
