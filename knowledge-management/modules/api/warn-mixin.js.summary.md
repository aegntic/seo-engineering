# Summary of warn-mixin.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/tar/lib/warn-mixin.js`

## Content Preview
```
'use strict'
module.exports = Base => class extends Base {
  warn (code, message, data = {}) {
    if (this.file) {
      data.file = this.file
    }
    if (this.cwd) {
      data.cwd = this.cwd
    }
    data.code = message instanceof Error && message.code || code
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 725 characters
- Lines: 25
