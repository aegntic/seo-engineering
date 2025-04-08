# Summary of buildMatchMemberExpression.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/validators/buildMatchMemberExpression.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildMatchMemberExpression;
var _matchesPattern = require("./matchesPattern.js");
function buildMatchMemberExpression(match, allowPartial) {
  const parts = match.split(".");
  return member => (0, _matchesPattern.default)(member, parts, allowPartial);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 409 characters
- Lines: 14
