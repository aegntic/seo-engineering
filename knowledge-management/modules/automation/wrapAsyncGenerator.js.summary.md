# Summary of wrapAsyncGenerator.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/helpers/lib/helpers/wrapAsyncGenerator.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _wrapAsyncGenerator;
var _OverloadYield = require("./OverloadYield.js");
function _wrapAsyncGenerator(fn) {
  return function () {
    return new AsyncGenerator(fn.apply(this, arguments));
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2405 characters
- Lines: 98
