# Summary of export-async-behaviors.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/sinon/lib/sinon/util/core/export-async-behaviors.js`

## Content Preview
```
"use strict";

const arrayProto = require("@sinonjs/commons").prototypes.array;
const reduce = arrayProto.reduce;

module.exports = function exportAsyncBehaviors(behaviorMethods) {
    return reduce(
        Object.keys(behaviorMethods),
        function (acc, method) {
            // need to avoid creating another async versions of the newly added async methods
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 825 characters
- Lines: 26
