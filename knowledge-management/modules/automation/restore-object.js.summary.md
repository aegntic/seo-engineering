# Summary of restore-object.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/sinon/lib/sinon/restore-object.js`

## Content Preview
```
"use strict";

const walkObject = require("./util/core/walk-object");

function filter(object, property) {
    return object[property].restore && object[property].restore.sinon;
}

function restore(object, property) {
    object[property].restore();
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 369 characters
- Lines: 18
