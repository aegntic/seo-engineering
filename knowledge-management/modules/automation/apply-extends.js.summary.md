# Summary of apply-extends.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/node_modules/yargs/build/lib/apply-extends.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyExtends = void 0;
const fs = require("fs");
const path = require("path");
const yerror_1 = require("./yerror");
let previouslyVisitedConfigs = [];
function checkForCircularExtends(cfgPath) {
    if (previouslyVisitedConfigs.indexOf(cfgPath) > -1) {
        throw new yerror_1.YError(`Circular extended configurations: '${cfgPath}'.`);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2488 characters
- Lines: 66
