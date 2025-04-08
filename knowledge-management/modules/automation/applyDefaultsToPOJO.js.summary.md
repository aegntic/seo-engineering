# Summary of applyDefaultsToPOJO.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/model/applyDefaultsToPOJO.js`

## Content Preview
```
'use strict';

module.exports = function applyDefaultsToPOJO(doc, schema) {
  const paths = Object.keys(schema.paths);
  const plen = paths.length;

  for (let i = 0; i < plen; ++i) {
    let curPath = '';
    const p = paths[i];

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1444 characters
- Lines: 53
