# Summary of copy-prototype-methods.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@sinonjs/commons/lib/prototypes/copy-prototype-methods.js`

## Content Preview
```
"use strict";

var call = Function.call;
var throwsOnProto = require("./throws-on-proto");

var disallowedProperties = [
    // ignore size because it throws from Map
    "size",
    "caller",
    "callee",
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1010 characters
- Lines: 41
