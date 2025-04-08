# Summary of onlyOnce.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/async/internal/onlyOnce.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onlyOnce;
function onlyOnce(fn) {
    return function (...args) {
        if (fn === null) throw new Error("Callback was already called.");
        var callFn = fn;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 360 characters
- Lines: 15
