# Summary of inherit.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/utils/inherit.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = inherit;
function inherit(key, child, parent) {
  if (child && parent) {
    child[key] = Array.from(new Set([].concat(child[key], parent[key]).filter(Boolean)));
  }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 304 characters
- Lines: 14
