# Summary of mongo_credentials.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/lib/cmap/auth/mongo_credentials.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoCredentials = exports.DEFAULT_ALLOWED_HOSTS = void 0;
const error_1 = require("../../error");
const gssapi_1 = require("./gssapi");
const providers_1 = require("./providers");
// https://github.com/mongodb/specifications/blob/master/source/auth/auth.rst
function getDefaultAuthMechanism(hello) {
    if (hello) {
        // If hello contains saslSupportedMechs, use scram-sha-256
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 8789 characters
- Lines: 177
