# Summary of modifiedPaths.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/update/modifiedPaths.js`

## Content Preview
```
'use strict';

const _modifiedPaths = require('../common').modifiedPaths;

/**
 * Given an update document with potential update operators (`$set`, etc.)
 * returns an object whose keys are the directly modified paths.
 *
 * If there are any top-level keys that don't start with `$`, we assume those
 * will get wrapped in a `$set`. The Mongoose Query is responsible for wrapping
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 845 characters
- Lines: 34
