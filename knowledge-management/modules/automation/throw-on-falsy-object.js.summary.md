# Summary of throw-on-falsy-object.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/sinon/lib/sinon/throw-on-falsy-object.js`

## Content Preview
```
"use strict";
const valueToString = require("@sinonjs/commons").valueToString;

function throwOnFalsyObject(object, property) {
    if (property && !object) {
        const type = object === null ? "null" : "undefined";
        throw new Error(
            `Trying to stub property '${valueToString(property)}' of ${type}`,
        );
    }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 381 characters
- Lines: 14
