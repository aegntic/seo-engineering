# Summary of delete.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/lib/operations/delete.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteManyOperation = exports.DeleteOneOperation = exports.DeleteOperation = void 0;
exports.makeDeleteStatement = makeDeleteStatement;
const error_1 = require("../error");
const command_1 = require("./command");
const operation_1 = require("./operation");
/** @internal */
class DeleteOperation extends command_1.CommandOperation {
    constructor(ns, statements, options) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 4316 characters
- Lines: 116
