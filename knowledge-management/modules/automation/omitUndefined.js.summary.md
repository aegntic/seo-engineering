# Summary of omitUndefined.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/omitUndefined.js`

## Content Preview
```
'use strict';

module.exports = function omitUndefined(val) {
  if (val == null || typeof val !== 'object') {
    return val;
  }
  if (Array.isArray(val)) {
    for (let i = val.length - 1; i >= 0; --i) {
      if (val[i] === undefined) {
        val.splice(i, 1);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 405 characters
- Lines: 21
