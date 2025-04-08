# Summary of castArrayFilters.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/update/castArrayFilters.js`

## Content Preview
```
'use strict';

const castFilterPath = require('../query/castFilterPath');
const cleanPositionalOperators = require('../schema/cleanPositionalOperators');
const getPath = require('../schema/getPath');
const updatedPathsByArrayFilter = require('./updatedPathsByArrayFilter');

module.exports = function castArrayFilters(query) {
  const arrayFilters = query.options.arrayFilters;
  const update = query.getUpdate();
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 4150 characters
- Lines: 110
