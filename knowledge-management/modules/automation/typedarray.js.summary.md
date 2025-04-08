# Summary of typedarray.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/loupe/lib/typedarray.js`

## Content Preview
```
import getFuncName from 'get-func-name'
import { truncator, truncate, inspectProperty, inspectList } from './helpers'

const getArrayName = array => {
  // We need to special case Node.js' Buffers, which report to be Uint8Array
  if (typeof Buffer === 'function' && array instanceof Buffer) {
    return 'Buffer'
  }
  if (array[Symbol.toStringTag]) {
    return array[Symbol.toStringTag]
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1670 characters
- Lines: 46
