# Summary of toPropertyKey.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/helpers/lib/helpers/toPropertyKey.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toPropertyKey;
var _toPrimitive = require("./toPrimitive.js");
function toPropertyKey(arg) {
  var key = (0, _toPrimitive.default)(arg, "string");
  return typeof key === "symbol" ? key : String(key);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 344 characters
- Lines: 14
