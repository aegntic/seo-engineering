# Summary of walk.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/sinon/lib/sinon/util/core/walk.js`

## Content Preview
```
"use strict";

const forEach = require("@sinonjs/commons").prototypes.array.forEach;

function walkInternal(obj, iterator, context, originalObj, seen) {
    let prop;
    const proto = Object.getPrototypeOf(obj);

    if (typeof Object.getOwnPropertyNames !== "function") {
        // We explicitly want to enumerate through all of the prototype's properties
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1830 characters
- Lines: 50
