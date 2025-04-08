# Summary of jsesc.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/jsesc/jsesc.js`

## Content Preview
```
'use strict';

const object = {};
const hasOwnProperty = object.hasOwnProperty;
const forOwn = (object, callback) => {
	for (const key in object) {
		if (hasOwnProperty.call(object, key)) {
			callback(key, object[key]);
		}
	}
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 8902 characters
- Lines: 338
