# Summary of tracker-base.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/are-we-there-yet/lib/tracker-base.js`

## Content Preview
```
'use strict'
var EventEmitter = require('events').EventEmitter
var util = require('util')

var trackerId = 0
var TrackerBase = module.exports = function (name) {
  EventEmitter.call(this)
  this.id = ++trackerId
  this.name = name
}
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 274 characters
- Lines: 12
