# Summary of circular.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/object-inspect/example/circular.js`

## Content Preview
```
'use strict';

var inspect = require('../');
var obj = { a: 1, b: [3, 4] };
obj.c = obj;
console.log(inspect(obj));

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 116 characters
- Lines: 7
