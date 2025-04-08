# Summary of mkdirp-manual.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mkdirp/lib/mkdirp-manual.js`

## Content Preview
```
const {dirname} = require('path')

const mkdirpManual = (path, opts, made) => {
  opts.recursive = false
  const parent = dirname(path)
  if (parent === path) {
    return opts.mkdirAsync(path, opts).catch(er => {
      // swallowed by recursive implementation on posix systems
      // any other error is a failure
      if (er.code !== 'EISDIR')
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1610 characters
- Lines: 65
