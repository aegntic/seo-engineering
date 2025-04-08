# Summary of is-restorable.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/sinon/lib/sinon/util/core/is-restorable.js`

## Content Preview
```
"use strict";

function isRestorable(obj) {
    return (
        typeof obj === "function" &&
        typeof obj.restore === "function" &&
        obj.restore.sinon
    );
}

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 206 characters
- Lines: 12
