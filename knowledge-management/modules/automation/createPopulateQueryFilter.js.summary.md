# Summary of createPopulateQueryFilter.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/populate/createPopulateQueryFilter.js`

## Content Preview
```
'use strict';

const SkipPopulateValue = require('./skipPopulateValue');
const parentPaths = require('../path/parentPaths');
const { trusted } = require('../query/trusted');
const hasDollarKeys = require('../query/hasDollarKeys');

module.exports = function createPopulateQueryFilter(ids, _match, _foreignField, model, skipInvalidIds) {
  const match = _formatMatch(_match);

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3143 characters
- Lines: 98
