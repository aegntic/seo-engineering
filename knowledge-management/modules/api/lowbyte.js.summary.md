# Summary of lowbyte.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/object-inspect/test/lowbyte.js`

## Content Preview
```
var test = require('tape');
var inspect = require('../');

var obj = { x: 'a\r\nb', y: '\x05! \x1f \x12' };

test('interpolate low bytes', function (t) {
    t.plan(1);
    t.equal(
        inspect(obj),
        "{ x: 'a\\r\\nb', y: '\\x05! \\x1F \\x12' }"
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 268 characters
- Lines: 13
