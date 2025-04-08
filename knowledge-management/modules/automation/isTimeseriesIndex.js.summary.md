# Summary of isTimeseriesIndex.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/indexes/isTimeseriesIndex.js`

## Content Preview
```
'use strict';

/**
 * Returns `true` if the given index matches the schema's `timestamps` options
 */

module.exports = function isTimeseriesIndex(dbIndex, schemaOptions) {
  if (schemaOptions.timeseries == null) {
    return false;
  }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 507 characters
- Lines: 17
