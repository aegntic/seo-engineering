# Summary of destroy.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/readable-stream/lib/internal/streams/destroy.js`

## Content Preview
```
'use strict';

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;
  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;
  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3109 characters
- Lines: 96
