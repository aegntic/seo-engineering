# Summary of kill_cursors.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/lib/operations/kill_cursors.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KillCursorsOperation = void 0;
const error_1 = require("../error");
const operation_1 = require("./operation");
class KillCursorsOperation extends operation_1.AbstractCallbackOperation {
    constructor(cursorId, ns, server, options) {
        super(options);
        this.ns = ns;
        this.cursorId = cursorId;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1440 characters
- Lines: 32
