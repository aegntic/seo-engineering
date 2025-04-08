# Summary of load-esm.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@istanbuljs/load-nyc-config/load-esm.js`

## Content Preview
```
'use strict';

const {pathToFileURL} = require('url');

module.exports = async filename => {
	const mod = await import(pathToFileURL(filename));
	if ('default' in mod === false) {
		throw new Error(`${filename} has no default export`);
	}

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 264 characters
- Lines: 13
