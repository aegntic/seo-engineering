# Summary of classPrivateGetter.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/helpers/lib/helpers/classPrivateGetter.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _classPrivateGetter;
var _assertClassBrand = require("./assertClassBrand.js");
function _classPrivateGetter(privateMap, receiver, getter) {
  return getter((0, _assertClassBrand.default)(privateMap, receiver));
}
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 359 characters
- Lines: 13
