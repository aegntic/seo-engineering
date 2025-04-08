# Summary of deep.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/object-inspect/test/deep.js`

## Content Preview
```
var inspect = require('../');
var test = require('tape');

test('deep', function (t) {
    t.plan(4);
    var obj = [[[[[[500]]]]]];
    t.equal(inspect(obj), '[ [ [ [ [ [Array] ] ] ] ] ]');
    t.equal(inspect(obj, { depth: 4 }), '[ [ [ [ [Array] ] ] ] ]');
    t.equal(inspect(obj, { depth: 2 }), '[ [ [Array] ] ]');

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 400 characters
- Lines: 13
