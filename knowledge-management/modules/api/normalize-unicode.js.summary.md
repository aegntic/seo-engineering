# Summary of normalize-unicode.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/tar/lib/normalize-unicode.js`

## Content Preview
```
// warning: extremely hot code path.
// This has been meticulously optimized for use
// within npm install on large package trees.
// Do not edit without careful benchmarking.
const normalizeCache = Object.create(null)
const { hasOwnProperty } = Object.prototype
module.exports = s => {
  if (!hasOwnProperty.call(normalizeCache, s)) {
    normalizeCache[s] = s.normalize('NFD')
  }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 412 characters
- Lines: 13
