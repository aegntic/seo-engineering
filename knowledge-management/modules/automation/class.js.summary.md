# Summary of class.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/loupe/lib/class.js`

## Content Preview
```
import getFuncName from 'get-func-name'
import inspectObject from './object'

const toStringTag = typeof Symbol !== 'undefined' && Symbol.toStringTag ? Symbol.toStringTag : false

export default function inspectClass(value, options) {
  let name = ''
  if (toStringTag && toStringTag in value) {
    name = value[toStringTag]
  }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 597 characters
- Lines: 19
