# Summary of shared.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/lib/cmap/wire_protocol/shared.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSharded = exports.getReadPreference = void 0;
const error_1 = require("../../error");
const read_preference_1 = require("../../read_preference");
const common_1 = require("../../sdam/common");
const topology_description_1 = require("../../sdam/topology_description");
function getReadPreference(options) {
    // Default to command version of the readPreference
    let readPreference = options?.readPreference ?? read_preference_1.ReadPreference.primary;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1879 characters
- Lines: 40
