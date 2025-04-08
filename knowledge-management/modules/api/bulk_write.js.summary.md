# Summary of bulk_write.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/lib/operations/bulk_write.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkWriteOperation = void 0;
const operation_1 = require("./operation");
/** @internal */
class BulkWriteOperation extends operation_1.AbstractOperation {
    constructor(collection, operations, options) {
        super(options);
        this.options = options;
        this.collection = collection;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1416 characters
- Lines: 39
