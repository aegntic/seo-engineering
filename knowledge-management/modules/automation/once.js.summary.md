# Summary of once.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/once.js`

## Content Preview
```
'use strict';

module.exports = function once(fn) {
  let called = false;
  return function() {
    if (called) {
      return;
    }
    called = true;
    return fn.apply(null, arguments);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 199 characters
- Lines: 13
