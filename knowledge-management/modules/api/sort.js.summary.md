# Summary of sort.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/lib/sort.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSort = formatSort;
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
- Estimated size: 2722 characters
- Lines: 96
