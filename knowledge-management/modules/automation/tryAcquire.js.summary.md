# Summary of tryAcquire.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/async-mutex/lib/tryAcquire.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryAcquire = void 0;
var errors_1 = require("./errors");
var withTimeout_1 = require("./withTimeout");
// eslint-disable-next-lisne @typescript-eslint/explicit-module-boundary-types
function tryAcquire(sync, alreadyAcquiredError) {
    if (alreadyAcquiredError === void 0) { alreadyAcquiredError = errors_1.E_ALREADY_LOCKED; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (0, withTimeout_1.withTimeout)(sync, 0, alreadyAcquiredError);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 588 characters
- Lines: 13
