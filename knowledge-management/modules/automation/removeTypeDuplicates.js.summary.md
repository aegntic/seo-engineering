# Summary of removeTypeDuplicates.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/modifications/flow/removeTypeDuplicates.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removeTypeDuplicates;
var _index = require("../../validators/generated/index.js");
function getQualifiedName(node) {
  return (0, _index.isIdentifier)(node) ? node.name : `${node.id.name}.${getQualifiedName(node.qualification)}`;
}
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1869 characters
- Lines: 66
