# Summary of function-to-string.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/sinon/lib/sinon/util/core/function-to-string.js`

## Content Preview
```
"use strict";

module.exports = function toString() {
    let i, prop, thisValue;
    if (this.getCall && this.callCount) {
        i = this.callCount;

        while (i--) {
            thisValue = this.getCall(i).thisValue;

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 664 characters
- Lines: 26
