# Summary of decorateBulkWriteResult.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/model/decorateBulkWriteResult.js`

## Content Preview
```
'use strict';

module.exports = function decorateBulkWriteResult(resultOrError, validationErrors, results) {
  resultOrError.mongoose = resultOrError.mongoose || {};
  resultOrError.mongoose.validationErrors = validationErrors;
  resultOrError.mongoose.results = results;
  return resultOrError;
};

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 299 characters
- Lines: 9
