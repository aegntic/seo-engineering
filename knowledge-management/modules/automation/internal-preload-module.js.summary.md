# Summary of internal-preload-module.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/node-preload/internal-preload-module.js`

## Content Preview
```
'use strict';

function findInternalPreloadModule() {
	/* This song-and-dance is to keep esm happy. */
	let mod = module;
	const seen = new Set([mod]);
	while ((mod = mod.parent)) {
		/* Generally if we're being preloaded then
		 * mod.parent.id should be 'internal/preload' */
		/* istanbul ignore next: paranoia */
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 582 characters
- Lines: 26
