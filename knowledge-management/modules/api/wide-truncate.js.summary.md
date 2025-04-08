# Summary of wide-truncate.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/gauge/wide-truncate.js`

## Content Preview
```
'use strict'
var stringWidth = require('string-width')
var stripAnsi = require('strip-ansi')

module.exports = wideTruncate

function wideTruncate (str, target) {
  if (stringWidth(str) === 0) return str
  if (target <= 0) return ''
  if (stringWidth(str) <= target) return str
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 828 characters
- Lines: 26
