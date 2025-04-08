# Summary of applyStaticHooks.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/model/applyStaticHooks.js`

## Content Preview
```
'use strict';

const promiseOrCallback = require('../promiseOrCallback');
const { queryMiddlewareFunctions, aggregateMiddlewareFunctions, modelMiddlewareFunctions, documentMiddlewareFunctions } = require('../../constants');

const middlewareFunctions = Array.from(
  new Set([
    ...queryMiddlewareFunctions,
    ...aggregateMiddlewareFunctions,
    ...modelMiddlewareFunctions,
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2628 characters
- Lines: 81
