# Summary of bind.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/axios/lib/helpers/bind.js`

## Content Preview
```
'use strict';

export default function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 134 characters
- Lines: 8
