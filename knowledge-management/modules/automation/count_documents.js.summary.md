# Summary of count_documents.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/lib/operations/count_documents.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountDocumentsOperation = void 0;
const aggregate_1 = require("./aggregate");
/** @internal */
class CountDocumentsOperation extends aggregate_1.AggregateOperation {
    constructor(collection, query, options) {
        const pipeline = [];
        pipeline.push({ $match: query });
        if (typeof options.skip === 'number') {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1453 characters
- Lines: 37
