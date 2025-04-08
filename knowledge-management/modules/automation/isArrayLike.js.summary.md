# Summary of isArrayLike.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/async/internal/isArrayLike.js`

## Content Preview
```
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = isArrayLike;
function isArrayLike(value) {
    return value && typeof value.length === 'number' && value.length >= 0 && value.length % 1 === 0;
}
module.exports = exports.default;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 279 characters
- Lines: 10
