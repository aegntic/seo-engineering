# Summary of list_collections_cursor.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/lib/cursor/list_collections_cursor.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCollectionsCursor = void 0;
const execute_operation_1 = require("../operations/execute_operation");
const list_collections_1 = require("../operations/list_collections");
const abstract_cursor_1 = require("./abstract_cursor");
/** @public */
class ListCollectionsCursor extends abstract_cursor_1.AbstractCursor {
    constructor(db, filter, options) {
        super(db.client, db.s.namespace, options);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1338 characters
- Lines: 34
