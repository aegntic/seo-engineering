# Summary of isNativeFunction.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/helpers/lib/helpers/isNativeFunction.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _isNativeFunction;
function _isNativeFunction(fn) {
  try {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  } catch (_e) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 335 characters
- Lines: 16
