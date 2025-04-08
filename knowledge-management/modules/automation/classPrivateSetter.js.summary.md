# Summary of classPrivateSetter.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/helpers/lib/helpers/classPrivateSetter.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _classPrivateSetter;
var _assertClassBrand = require("./assertClassBrand.js");
function _classPrivateSetter(privateMap, setter, receiver, value) {
  setter((0, _assertClassBrand.default)(privateMap, receiver), value);
  return value;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 382 characters
- Lines: 14
