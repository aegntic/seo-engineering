# Summary of superPropGet.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/helpers/lib/helpers/superPropGet.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _superPropGet;
var _get = require("./get.js");
var _getPrototypeOf = require("./getPrototypeOf.js");
function _superPropGet(classArg, property, receiver, flags) {
  var result = (0, _get.default)((0, _getPrototypeOf.default)(flags & 1 ? classArg.prototype : classArg), property, receiver);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 558 characters
- Lines: 17
