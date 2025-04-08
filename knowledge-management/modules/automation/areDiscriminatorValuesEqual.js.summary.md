# Summary of areDiscriminatorValuesEqual.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/discriminator/areDiscriminatorValuesEqual.js`

## Content Preview
```
'use strict';

const isBsonType = require('../isBsonType');

module.exports = function areDiscriminatorValuesEqual(a, b) {
  if (typeof a === 'string' && typeof b === 'string') {
    return a === b;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 412 characters
- Lines: 17
