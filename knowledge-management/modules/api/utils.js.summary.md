# Summary of utils.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/node-fetch/node_modules/whatwg-url/lib/utils.js`

## Content Preview
```
"use strict";

module.exports.mixin = function mixin(target, source) {
  const keys = Object.getOwnPropertyNames(source);
  for (let i = 0; i < keys.length; ++i) {
    Object.defineProperty(target, keys[i], Object.getOwnPropertyDescriptor(source, keys[i]));
  }
};

module.exports.wrapperSymbol = Symbol("wrapper");
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 562 characters
- Lines: 21
