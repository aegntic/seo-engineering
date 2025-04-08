# Summary of isBinding.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/validators/isBinding.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isBinding;
var _getBindingIdentifiers = require("../retrievers/getBindingIdentifiers.js");
function isBinding(node, parent, grandparent) {
  if (grandparent && node.type === "Identifier" && parent.type === "ObjectProperty" && grandparent.type === "ObjectExpression") {
    return false;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 776 characters
- Lines: 28
