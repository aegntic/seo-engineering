# Summary of readable.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/readable-stream/readable.js`

## Content Preview
```
var Stream = require('stream');
if (process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream.Readable;
  Object.assign(module.exports, Stream);
  module.exports.Stream = Stream;
} else {
  exports = module.exports = require('./lib/_stream_readable.js');
  exports.Stream = Stream || exports;
  exports.Readable = exports;
  exports.Writable = require('./lib/_stream_writable.js');
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 729 characters
- Lines: 17
