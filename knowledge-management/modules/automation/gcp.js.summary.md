# Summary of gcp.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb/lib/client-side-encryption/providers/gcp.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGCPCredentials = loadGCPCredentials;
const deps_1 = require("../../deps");
/** @internal */
async function loadGCPCredentials(kmsProviders) {
    const gcpMetadata = (0, deps_1.getGcpMetadata)();
    if ('kModuleError' in gcpMetadata) {
        return kmsProviders;
    }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 578 characters
- Lines: 16
