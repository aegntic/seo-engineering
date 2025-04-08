# Summary of yerror.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/node_modules/yargs/build/lib/yerror.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YError = void 0;
class YError extends Error {
    constructor(msg) {
        super(msg || 'yargs error');
        this.name = 'YError';
        Error.captureStackTrace(this, YError);
    }
}
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 301 characters
- Lines: 12
