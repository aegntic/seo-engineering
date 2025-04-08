# Summary of err.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/object-inspect/test/err.js`

## Content Preview
```
var test = require('tape');
var ErrorWithCause = require('error-cause/Error');

var inspect = require('../');

test('type error', function (t) {
    t.plan(1);
    var aerr = new TypeError();
    aerr.foo = 555;
    aerr.bar = [1, 2, 3];
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1536 characters
- Lines: 49
