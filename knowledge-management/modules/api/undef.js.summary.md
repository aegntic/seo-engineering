# Summary of undef.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/object-inspect/test/undef.js`

## Content Preview
```
var test = require('tape');
var inspect = require('../');

var obj = { a: 1, b: [3, 4, undefined, null], c: undefined, d: null };

test('undef and null', function (t) {
    t.plan(1);
    t.equal(
        inspect(obj),
        '{ a: 1, b: [ 3, 4, undefined, null ], c: undefined, d: null }'
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 302 characters
- Lines: 13
