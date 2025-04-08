# Summary of mongocr.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/lib/cmap/auth/mongocr.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoCR = void 0;
const crypto = require("crypto");
const error_1 = require("../../error");
const utils_1 = require("../../utils");
const auth_provider_1 = require("./auth_provider");
class MongoCR extends auth_provider_1.AuthProvider {
    async auth(authContext) {
        const { connection, credentials } = authContext;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1374 characters
- Lines: 35
