# Summary of str.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@istanbuljs/load-nyc-config/node_modules/js-yaml/lib/js-yaml/type/str.js`

## Content Preview
```
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return data !== null ? data : ''; }
});

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 189 characters
- Lines: 9
