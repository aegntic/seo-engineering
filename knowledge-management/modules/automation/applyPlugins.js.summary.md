# Summary of applyPlugins.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/schema/applyPlugins.js`

## Content Preview
```
'use strict';

module.exports = function applyPlugins(schema, plugins, options, cacheKey) {
  if (schema[cacheKey]) {
    return;
  }
  schema[cacheKey] = true;

  if (!options || !options.skipTopLevel) {
    let pluginTags = null;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1557 characters
- Lines: 56
