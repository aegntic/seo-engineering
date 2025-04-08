# Summary of mkdirp-native.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mkdirp/lib/mkdirp-native.js`

## Content Preview
```
const {dirname} = require('path')
const {findMade, findMadeSync} = require('./find-made.js')
const {mkdirpManual, mkdirpManualSync} = require('./mkdirp-manual.js')

const mkdirpNative = (path, opts) => {
  opts.recursive = true
  const parent = dirname(path)
  if (parent === path)
    return opts.mkdirAsync(path, opts)

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 969 characters
- Lines: 40
