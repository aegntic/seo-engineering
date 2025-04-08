# Summary of applyBuiltinPlugins.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/schema/applyBuiltinPlugins.js`

## Content Preview
```
'use strict';

const builtinPlugins = require('../../plugins');

module.exports = function applyBuiltinPlugins(schema) {
  for (const plugin of Object.values(builtinPlugins)) {
    plugin(schema, { deduplicate: true });
  }
  schema.plugins = Object.values(builtinPlugins).
    map(fn => ({ fn, opts: { deduplicate: true } })).
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 359 characters
- Lines: 13
