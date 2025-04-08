# Summary of tracker-stream.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/are-we-there-yet/lib/tracker-stream.js`

## Content Preview
```
'use strict'
var util = require('util')
var stream = require('readable-stream')
var delegate = require('delegates')
var Tracker = require('./tracker.js')

var TrackerStream = module.exports = function (name, size, options) {
  stream.Transform.call(this, options)
  this.tracker = new Tracker(name, size)
  this.name = name
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 963 characters
- Lines: 37
