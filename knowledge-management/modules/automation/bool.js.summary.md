# Summary of bool.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@istanbuljs/load-nyc-config/node_modules/js-yaml/lib/js-yaml/type/bool.js`

## Content Preview
```
'use strict';

var Type = require('../type');

function resolveYamlBoolean(data) {
  if (data === null) return false;

  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 971 characters
- Lines: 36
