# Summary of getFunctionName.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/getFunctionName.js`

## Content Preview
```
'use strict';

const functionNameRE = /^function\s*([^\s(]+)/;

module.exports = function(fn) {
  return (
    fn.name ||
    (fn.toString().trim().match(functionNameRE) || [])[1]
  );
};
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 188 characters
- Lines: 11
