# Summary of isScope.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/validators/isScope.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isScope;
var _index = require("./generated/index.js");
function isScope(node, parent) {
  if ((0, _index.isBlockStatement)(node) && ((0, _index.isFunction)(parent) || (0, _index.isCatchClause)(parent))) {
    return false;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 534 characters
- Lines: 19
