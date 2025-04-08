# Summary of region.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/caniuse-lite/dist/unpacker/region.js`

## Content Preview
```
'use strict'

const browsers = require('./browsers').browsers

function unpackRegion(packed) {
  return Object.keys(packed).reduce((list, browser) => {
    let data = packed[browser]
    list[browsers[browser]] = Object.keys(data).reduce((memo, key) => {
      let stats = data[key]
      if (key === '_') {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 550 characters
- Lines: 23
