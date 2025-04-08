# Summary of shallowEqual.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/utils/shallowEqual.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = shallowEqual;
function shallowEqual(actual, expected) {
  const keys = Object.keys(expected);
  for (const key of keys) {
    if (actual[key] !== expected[key]) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 350 characters
- Lines: 18
