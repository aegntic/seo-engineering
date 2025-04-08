# Summary of promisify.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/agent-base/dist/src/promisify.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function promisify(fn) {
    return function (req, opts) {
        return new Promise((resolve, reject) => {
            fn.call(this, req, opts, (err, rtn) => {
                if (err) {
                    reject(err);
                }
                else {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 495 characters
- Lines: 18
