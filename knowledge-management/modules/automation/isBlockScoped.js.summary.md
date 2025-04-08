# Summary of isBlockScoped.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/validators/isBlockScoped.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isBlockScoped;
var _index = require("./generated/index.js");
var _isLet = require("./isLet.js");
function isBlockScoped(node) {
  return (0, _index.isFunctionDeclaration)(node) || (0, _index.isClassDeclaration)(node) || (0, _isLet.default)(node);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 390 characters
- Lines: 14
