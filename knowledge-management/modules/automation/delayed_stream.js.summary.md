# Summary of delayed_stream.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/delayed-stream/lib/delayed_stream.js`

## Content Preview
```
var Stream = require('stream').Stream;
var util = require('util');

module.exports = DelayedStream;
function DelayedStream() {
  this.source = null;
  this.dataSize = 0;
  this.maxDataSize = 1024 * 1024;
  this.pauseStream = true;

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2319 characters
- Lines: 108
