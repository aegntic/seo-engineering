# Summary of assertClassBrand.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/helpers/lib/helpers/assertClassBrand.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _assertClassBrand;
function _assertClassBrand(brand, receiver, returnValue) {
  if (typeof brand === "function" ? brand === receiver : brand.has(receiver)) {
    return arguments.length < 3 ? receiver : returnValue;
  }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 438 characters
- Lines: 15
