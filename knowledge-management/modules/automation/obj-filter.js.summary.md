# Summary of obj-filter.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/node_modules/yargs/build/lib/obj-filter.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objFilter = void 0;
const common_types_1 = require("./common-types");
function objFilter(original = {}, filter = () => true) {
    const obj = {};
    common_types_1.objectKeys(original).forEach((key) => {
        if (filter(key, original[key])) {
            obj[key] = original[key];
        }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 438 characters
- Lines: 15
