# Summary of get-own-property-symbols.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/has-symbols/test/shams/get-own-property-symbols.js`

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
- Estimated size: 760 characters
- Lines: 30
