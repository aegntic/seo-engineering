# Summary of base-theme.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/gauge/base-theme.js`

## Content Preview
```
'use strict'
var spin = require('./spin.js')
var progressBar = require('./progress-bar.js')

module.exports = {
  activityIndicator: function (values, theme, width) {
    if (values.spun == null) return
    return spin(theme, values.spun)
  },
  progressbar: function (values, theme, width) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 395 characters
- Lines: 15
