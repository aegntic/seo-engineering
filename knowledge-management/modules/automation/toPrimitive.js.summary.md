# Summary of toPrimitive.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/helpers/lib/helpers/toPrimitive.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toPrimitive;
function toPrimitive(input, hint) {
  if (typeof input !== "object" || !input) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 543 characters
- Lines: 19
