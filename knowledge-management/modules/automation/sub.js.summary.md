# Summary of sub.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/argparse/lib/sub.js`

## Content Preview
```
// Limited implementation of python % string operator, supports only %s and %r for now
// (other formats are not used here, but may appear in custom templates)

'use strict'

const { inspect } = require('util')


module.exports = function sub(pattern, ...values) {
    let regex = /%(?:(%)|(-)?(\*)?(?:\((\w+)\))?([A-Za-z]))/g
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2252 characters
- Lines: 68
