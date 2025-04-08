# Summary of sort.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/lib/sort.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSort = void 0;
const error_1 = require("./error");
/** @internal */
function prepareDirection(direction = 1) {
    const value = `${direction}`.toLowerCase();
    if (isMeta(direction))
        return direction;
    switch (value) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2755 characters
- Lines: 97
