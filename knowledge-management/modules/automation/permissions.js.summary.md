# Summary of permissions.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mquery/lib/permissions.js`

## Content Preview
```
'use strict';

const denied = exports;

denied.distinct = function(self) {
  if (self._fields && Object.keys(self._fields).length > 0) {
    return 'field selection and slice';
  }

  const keys = Object.keys(denied.distinct);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1472 characters
- Lines: 79
