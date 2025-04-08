# Summary of use-native.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mkdirp/lib/use-native.js`

## Content Preview
```
const fs = require('fs')

const version = process.env.__TESTING_MKDIRP_NODE_VERSION__ || process.version
const versArr = version.replace(/^v/, '').split('.')
const hasNative = +versArr[0] > 10 || +versArr[0] === 10 && +versArr[1] >= 12

const useNative = !hasNative ? () => false : opts => opts.mkdir === fs.mkdir
const useNativeSync = !hasNative ? () => false : opts => opts.mkdirSync === fs.mkdirSync

module.exports = {useNative, useNativeSync}
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 448 characters
- Lines: 11
