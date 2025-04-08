# Summary of delete.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/lib/operations/delete.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDeleteStatement = exports.DeleteManyOperation = exports.DeleteOneOperation = exports.DeleteOperation = void 0;
const error_1 = require("../error");
const command_1 = require("./command");
const operation_1 = require("./operation");
/** @internal */
class DeleteOperation extends command_1.CommandCallbackOperation {
    constructor(ns, statements, options) {
        super(undefined, options);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 4639 characters
- Lines: 119
