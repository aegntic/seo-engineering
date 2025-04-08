# Summary of test-core-js.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/object-inspect/test-core-js.js`

## Content Preview
```
'use strict';

require('core-js');

var inspect = require('./');
var test = require('tape');

test('Maps', function (t) {
    t.equal(inspect(new Map([[1, 2]])), 'Map (1) {1 => 2}');
    t.end();
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 534 characters
- Lines: 27
