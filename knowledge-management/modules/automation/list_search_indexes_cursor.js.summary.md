# Summary of list_search_indexes_cursor.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/lib/cursor/list_search_indexes_cursor.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListSearchIndexesCursor = void 0;
const aggregation_cursor_1 = require("./aggregation_cursor");
/** @public */
class ListSearchIndexesCursor extends aggregation_cursor_1.AggregationCursor {
    /** @internal */
    constructor({ fullNamespace: ns, client }, name, options = {}) {
        const pipeline = name == null ? [{ $listSearchIndexes: {} }] : [{ $listSearchIndexes: { name } }];
        super(client, ns, pipeline, options);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 639 characters
- Lines: 14
