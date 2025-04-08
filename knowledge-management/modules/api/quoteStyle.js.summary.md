# Summary of quoteStyle.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/object-inspect/test/quoteStyle.js`

## Content Preview
```
'use strict';

var inspect = require('../');
var test = require('tape');

test('quoteStyle option', function (t) {
    t['throws'](function () { inspect(null, { quoteStyle: false }); }, 'false is not a valid value');
    t['throws'](function () { inspect(null, { quoteStyle: true }); }, 'true is not a valid value');
    t['throws'](function () { inspect(null, { quoteStyle: '' }); }, '"" is not a valid value');
    t['throws'](function () { inspect(null, { quoteStyle: {} }); }, '{} is not a valid value');
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1530 characters
- Lines: 27
