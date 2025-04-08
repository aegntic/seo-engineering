# Summary of strip-trailing-slashes.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/tar/lib/strip-trailing-slashes.js`

## Content Preview
```
// warning: extremely hot code path.
// This has been meticulously optimized for use
// within npm install on large package trees.
// Do not edit without careful benchmarking.
module.exports = str => {
  let i = str.length - 1
  let slashesStart = -1
  while (i > -1 && str.charAt(i) === '/') {
    slashesStart = i
    i--
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 394 characters
- Lines: 14
