# Summary of core-js.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/has-symbols/test/shams/core-js.js`

## Content Preview
```
'use strict';

var test = require('tape');

if (typeof Symbol === 'function' && typeof Symbol() === 'symbol') {
	test('has native Symbol support', function (t) {
		t.equal(typeof Symbol, 'function');
		t.equal(typeof Symbol(), 'symbol');
		t.end();
	});
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 797 characters
- Lines: 30
