# Summary of register.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/json5/lib/register.js`

## Content Preview
```
const fs = require('fs')
const JSON5 = require('./')

// eslint-disable-next-line node/no-deprecated-api
require.extensions['.json5'] = function (module, filename) {
    const content = fs.readFileSync(filename, 'utf8')
    try {
        module.exports = JSON5.parse(content)
    } catch (err) {
        err.message = filename + ': ' + err.message
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 374 characters
- Lines: 14
