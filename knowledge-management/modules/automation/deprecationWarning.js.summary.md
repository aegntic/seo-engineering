# Summary of deprecationWarning.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/utils/deprecationWarning.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = deprecationWarning;
const warnings = new Set();
function deprecationWarning(oldName, newName, prefix = "") {
  if (warnings.has(oldName)) return;
  warnings.add(oldName);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1201 characters
- Lines: 45
