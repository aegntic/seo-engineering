# Summary of appendToMemberExpression.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/modifications/appendToMemberExpression.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = appendToMemberExpression;
var _index = require("../builders/generated/index.js");
function appendToMemberExpression(member, append, computed = false) {
  member.object = (0, _index.memberExpression)(member.object, member.property, member.computed);
  member.property = append;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 480 characters
- Lines: 16
