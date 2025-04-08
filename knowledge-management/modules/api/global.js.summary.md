# Summary of global.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/object-inspect/test/global.js`

## Content Preview
```
'use strict';

var inspect = require('../');

var test = require('tape');
var globalThis = require('globalthis')();

test('global object', function (t) {
    /* eslint-env browser */
    var expected = typeof window === 'undefined' ? 'globalThis' : 'Window';
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 372 characters
- Lines: 18
