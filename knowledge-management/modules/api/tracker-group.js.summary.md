# Summary of tracker-group.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/are-we-there-yet/lib/tracker-group.js`

## Content Preview
```
'use strict'
var util = require('util')
var TrackerBase = require('./tracker-base.js')
var Tracker = require('./tracker.js')
var TrackerStream = require('./tracker-stream.js')

var TrackerGroup = module.exports = function (name) {
  TrackerBase.call(this, name)
  this.parentGroup = null
  this.trackers = []
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3281 characters
- Lines: 117
