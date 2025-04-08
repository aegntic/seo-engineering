# Summary of cast$expr.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/query/cast$expr.js`

## Content Preview
```
'use strict';

const CastError = require('../../error/cast');
const StrictModeError = require('../../error/strict');
const castNumber = require('../../cast/number');
const omitUndefined = require('../omitUndefined');

const booleanComparison = new Set(['$and', '$or']);
const comparisonOperator = new Set(['$cmp', '$eq', '$lt', '$lte', '$gt', '$gte']);
const arithmeticOperatorArray = new Set([
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 7663 characters
- Lines: 287
