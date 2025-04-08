# Summary of plain.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/lib/cmap/auth/plain.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plain = void 0;
const bson_1 = require("../../bson");
const error_1 = require("../../error");
const utils_1 = require("../../utils");
const auth_provider_1 = require("./auth_provider");
class Plain extends auth_provider_1.AuthProvider {
    async auth(authContext) {
        const { connection, credentials } = authContext;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1002 characters
- Lines: 26
