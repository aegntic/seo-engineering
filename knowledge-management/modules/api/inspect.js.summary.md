# Summary of inspect.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/object-inspect/example/inspect.js`

## Content Preview
```
'use strict';

/* eslint-env browser */
var inspect = require('../');

var d = document.createElement('div');
d.setAttribute('id', 'beep');
d.innerHTML = '<b>wooo</b><i>iiiii</i>';

console.log(inspect([d, { a: 3, b: 4, c: [5, 6, [7, [8, [9]]]] }]));
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 251 characters
- Lines: 11
