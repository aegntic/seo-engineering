# Summary of thread.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/hasha/thread.js`

## Content Preview
```
'use strict';
const fs = require('fs');
const crypto = require('crypto');
const {parentPort} = require('worker_threads');

const handlers = {
	hashFile: (algorithm, filePath) => new Promise((resolve, reject) => {
		const hasher = crypto.createHash(algorithm);
		fs.createReadStream(filePath)
			// TODO: Use `Stream.pipeline` when targeting Node.js 12.
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1496 characters
- Lines: 58
