# Summary of tracker.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/are-we-there-yet/lib/tracker.js`

## Content Preview
```
'use strict'
var util = require('util')
var TrackerBase = require('./tracker-base.js')

var Tracker = module.exports = function (name, todo) {
  TrackerBase.call(this, name)
  this.workDone = 0
  this.workTodo = todo || 0
}
util.inherits(Tracker, TrackerBase)
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 836 characters
- Lines: 33
