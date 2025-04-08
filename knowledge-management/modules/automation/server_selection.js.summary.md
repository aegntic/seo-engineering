# Summary of server_selection.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/lib/sdam/server_selection.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPreferenceServerSelector = exports.secondaryWritableServerSelector = exports.sameServerSelector = exports.writableServerSelector = exports.MIN_SECONDARY_WRITE_WIRE_VERSION = void 0;
const error_1 = require("../error");
const read_preference_1 = require("../read_preference");
const common_1 = require("./common");
// max staleness constants
const IDLE_WRITE_PERIOD = 10000;
const SMALLEST_MAX_STALENESS_SECONDS = 90;
//  Minimum version to try writes on secondaries.
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 10130 characters
- Lines: 226
