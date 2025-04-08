# Summary of addAutoId.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/schema/addAutoId.js`

## Content Preview
```
'use strict';

module.exports = function addAutoId(schema) {
  const _obj = { _id: { auto: true } };
  _obj._id[schema.options.typeKey] = 'ObjectId';
  schema.add(_obj);
};

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 173 characters
- Lines: 8
