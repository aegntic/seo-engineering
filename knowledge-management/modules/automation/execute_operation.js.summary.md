# Summary of execute_operation.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/lib/operations/execute_operation.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeOperation = void 0;
const error_1 = require("../error");
const read_preference_1 = require("../read_preference");
const server_selection_1 = require("../sdam/server_selection");
const utils_1 = require("../utils");
const operation_1 = require("./operation");
const MMAPv1_RETRY_WRITES_ERROR_CODE = error_1.MONGODB_ERROR_CODES.IllegalOperation;
const MMAPv1_RETRY_WRITES_ERROR_MESSAGE = 'This MongoDB deployment does not support retryable writes. Please add retryWrites=false to your connection string.';
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 7433 characters
- Lines: 162
