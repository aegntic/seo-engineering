# Summary of get-next-tick.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/sinon/lib/sinon/util/core/get-next-tick.js`

## Content Preview
```
"use strict";

/* istanbul ignore next : not testing that setTimeout works */
function nextTick(callback) {
    setTimeout(callback, 0);
}

module.exports = function getNextTick(process, setImmediate) {
    if (typeof process === "object" && typeof process.nextTick === "function") {
        return process.nextTick;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 430 characters
- Lines: 19
