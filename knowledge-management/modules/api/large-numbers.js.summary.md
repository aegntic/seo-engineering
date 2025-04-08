# Summary of large-numbers.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/tar/lib/large-numbers.js`

## Content Preview
```
'use strict'
// Tar can encode large and negative numbers using a leading byte of
// 0xff for negative, and 0x80 for positive.

const encode = (num, buf) => {
  if (!Number.isSafeInteger(num)) {
  // The number is so large that javascript cannot represent it with integer
  // precision.
    throw Error('cannot encode number outside of javascript safe integer range')
  } else if (num < 0) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2229 characters
- Lines: 105
