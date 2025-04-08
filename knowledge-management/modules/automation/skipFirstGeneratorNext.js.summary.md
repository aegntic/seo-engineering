# Summary of skipFirstGeneratorNext.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/helpers/lib/helpers/skipFirstGeneratorNext.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _skipFirstGeneratorNext;
function _skipFirstGeneratorNext(fn) {
  return function () {
    var it = fn.apply(this, arguments);
    it.next();
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 314 characters
- Lines: 16
