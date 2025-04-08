# Summary of end-of-stream.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/readable-stream/lib/internal/streams/end-of-stream.js`

## Content Preview
```
// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).

'use strict';

var ERR_STREAM_PREMATURE_CLOSE = require('../../../errors').codes.ERR_STREAM_PREMATURE_CLOSE;
function once(callback) {
  var called = false;
  return function () {
    if (called) return;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3084 characters
- Lines: 86
