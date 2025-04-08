# Summary of bulk_write.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/lib/operations/bulk_write.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkWriteOperation = void 0;
const operation_1 = require("./operation");
/** @internal */
class BulkWriteOperation extends operation_1.AbstractCallbackOperation {
    constructor(collection, operations, options) {
        super(options);
        this.options = options;
        this.collection = collection;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1449 characters
- Lines: 36
