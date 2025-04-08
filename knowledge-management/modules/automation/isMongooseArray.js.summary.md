# Summary of isMongooseArray.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/types/array/isMongooseArray.js`

## Content Preview
```
'use strict';

exports.isMongooseArray = function(mongooseArray) {
  return Array.isArray(mongooseArray) && mongooseArray.isMongooseArray;
};

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 142 characters
- Lines: 6
