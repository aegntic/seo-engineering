# Summary of isNode.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/validators/isNode.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isNode;
var _index = require("../definitions/index.js");
function isNode(node) {
  return !!(node && _index.VISITOR_KEYS[node.type]);
}
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 270 characters
- Lines: 13
