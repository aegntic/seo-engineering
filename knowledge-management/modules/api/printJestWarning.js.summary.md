# Summary of printJestWarning.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/printJestWarning.js`

## Content Preview
```
'use strict';

const utils = require('../utils');

if (typeof jest !== 'undefined' && !process.env.SUPPRESS_JEST_WARNINGS) {
  if (typeof window !== 'undefined') {
    utils.warn('Mongoose: looks like you\'re trying to test a Mongoose app ' +
      'with Jest\'s default jsdom test environment. Please make sure you read ' +
      'Mongoose\'s docs on configuring Jest to test Node.js apps: ' +
      'https://mongoosejs.com/docs/jest.html. Set the SUPPRESS_JEST_WARNINGS to true ' +
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 949 characters
- Lines: 22
