# Summary of default-exclude.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@istanbuljs/schema/default-exclude.js`

## Content Preview
```
'use strict';

const defaultExtension = require('./default-extension.js');
const testFileExtensions = defaultExtension
	.map(extension => extension.slice(1))
	.join(',');

module.exports = [
	'coverage/**',
	'packages/*/test{,s}/**',
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 578 characters
- Lines: 23
