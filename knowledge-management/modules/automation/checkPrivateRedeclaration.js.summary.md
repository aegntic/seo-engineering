# Summary of checkPrivateRedeclaration.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/helpers/lib/helpers/checkPrivateRedeclaration.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _checkPrivateRedeclaration;
function _checkPrivateRedeclaration(obj, privateCollection) {
  if (privateCollection.has(obj)) {
    throw new TypeError("Cannot initialize the same private elements twice on an object");
  }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 376 characters
- Lines: 14
