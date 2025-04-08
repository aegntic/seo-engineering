# Summary of js.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/default-require-extensions/js.js`

## Content Preview
```
'use strict';
const fs = require('fs');
const stripBom = require('strip-bom');

module.exports = (module, filename) => {
	const content = fs.readFileSync(filename, 'utf8');
	module._compile(stripBom(content), filename);
};

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 223 characters
- Lines: 9
