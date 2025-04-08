# Summary of instanceof.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/helpers/lib/helpers/instanceof.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _instanceof;
function _instanceof(left, right) {
  if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
    return !!right[Symbol.hasInstance](left);
  } else {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 369 characters
- Lines: 16
