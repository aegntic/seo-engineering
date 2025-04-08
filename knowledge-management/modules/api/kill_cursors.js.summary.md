# Summary of kill_cursors.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/lib/operations/kill_cursors.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KillCursorsOperation = void 0;
const error_1 = require("../error");
const utils_1 = require("../utils");
const operation_1 = require("./operation");
class KillCursorsOperation extends operation_1.AbstractOperation {
    constructor(cursorId, ns, server, options) {
        super(options);
        this.ns = ns;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1760 characters
- Lines: 45
