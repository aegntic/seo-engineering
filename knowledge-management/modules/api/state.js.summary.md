# Summary of state.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/readable-stream/lib/internal/streams/state.js`

## Content Preview
```
'use strict';

var ERR_INVALID_OPT_VALUE = require('../../../errors').codes.ERR_INVALID_OPT_VALUE;
function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}
function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 745 characters
- Lines: 22
