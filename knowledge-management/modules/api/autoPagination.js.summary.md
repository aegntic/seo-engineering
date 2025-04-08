# Summary of autoPagination.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/autoPagination.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAutoPaginationMethods = void 0;
const utils_js_1 = require("./utils.js");
class V1Iterator {
    constructor(firstPagePromise, requestArgs, spec, stripeResource) {
        this.index = 0;
        this.pagePromise = firstPagePromise;
        this.promiseCache = { currentPromise: null };
        this.requestArgs = requestArgs;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 11488 characters
- Lines: 292
