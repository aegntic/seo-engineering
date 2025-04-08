# Summary of lookupLocalFields.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/populate/lookupLocalFields.js`

## Content Preview
```
'use strict';

module.exports = function lookupLocalFields(cur, path, val) {
  if (cur == null) {
    return cur;
  }

  if (cur._doc != null) {
    cur = cur._doc;
  }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 720 characters
- Lines: 41
