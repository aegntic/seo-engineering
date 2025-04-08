# Summary of progress-bar.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/gauge/progress-bar.js`

## Content Preview
```
'use strict'
var validate = require('aproba')
var renderTemplate = require('./render-template.js')
var wideTruncate = require('./wide-truncate')
var stringWidth = require('string-width')

module.exports = function (theme, width, completed) {
  validate('ONN', [theme, width, completed])
  if (completed < 0) completed = 0
  if (completed > 1) completed = 1
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1000 characters
- Lines: 36
