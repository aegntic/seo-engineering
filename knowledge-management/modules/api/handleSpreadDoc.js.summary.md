# Summary of handleSpreadDoc.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/document/handleSpreadDoc.js`

## Content Preview
```
'use strict';

const utils = require('../../utils');

const keysToSkip = new Set(['__index', '__parentArray', '_doc']);

/**
 * Using spread operator on a Mongoose document gives you a
 * POJO that has a tendency to cause infinite recursion. So
 * we use this function on `set()` to prevent that.
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 847 characters
- Lines: 36
