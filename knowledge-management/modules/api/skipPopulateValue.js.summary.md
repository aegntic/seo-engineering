# Summary of skipPopulateValue.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/populate/skipPopulateValue.js`

## Content Preview
```
'use strict';

module.exports = function SkipPopulateValue(val) {
  if (!(this instanceof SkipPopulateValue)) {
    return new SkipPopulateValue(val);
  }

  this.val = val;
  return this;
};
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 192 characters
- Lines: 11
