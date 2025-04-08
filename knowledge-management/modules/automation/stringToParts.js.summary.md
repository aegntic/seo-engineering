# Summary of stringToParts.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mpath/lib/stringToParts.js`

## Content Preview
```
'use strict';

module.exports = function stringToParts(str) {
  const result = [];

  let curPropertyName = '';
  let state = 'DEFAULT';
  for (let i = 0; i < str.length; ++i) {
    // Fall back to treating as property name rather than bracket notation if
    // square brackets contains something other than a number.
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1394 characters
- Lines: 48
