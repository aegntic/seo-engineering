# Summary of bson.bundle.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/bson/lib/bson.bundle.js`

## Content Preview
```
var BSON = (function (exports) {
'use strict';

function isAnyArrayBuffer(value) {
    return ['[object ArrayBuffer]', '[object SharedArrayBuffer]'].includes(Object.prototype.toString.call(value));
}
function isUint8Array(value) {
    return Object.prototype.toString.call(value) === '[object Uint8Array]';
}
function isRegExp(d) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 158506 characters
- Lines: 4150
