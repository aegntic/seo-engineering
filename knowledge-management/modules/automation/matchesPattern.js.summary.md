# Summary of matchesPattern.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/validators/matchesPattern.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = matchesPattern;
var _index = require("./generated/index.js");
function matchesPattern(member, match, allowPartial) {
  if (!(0, _index.isMemberExpression)(member)) return false;
  const parts = Array.isArray(match) ? match : match.split(".");
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1103 characters
- Lines: 37
