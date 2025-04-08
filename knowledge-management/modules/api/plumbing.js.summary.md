# Summary of plumbing.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/gauge/plumbing.js`

## Content Preview
```
'use strict'
var consoleControl = require('console-control-strings')
var renderTemplate = require('./render-template.js')
var validate = require('aproba')

var Plumbing = module.exports = function (theme, template, width) {
  if (!width) width = 80
  validate('OAN', [theme, template, width])
  this.showing = false
  this.theme = theme
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1269 characters
- Lines: 49
