# Summary of preload-list.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/node-preload/preload-list.js`

## Content Preview
```
'use strict';

const path = require('path');
const preloadListEnv = require('./preload-list-env.js');

function getPreloadList() {
	const env = process.env[preloadListEnv];
	if (!env) {
		return [];
	}
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 276 characters
- Lines: 16
