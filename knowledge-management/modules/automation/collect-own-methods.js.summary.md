# Summary of collect-own-methods.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/sinon/lib/sinon/collect-own-methods.js`

## Content Preview
```
"use strict";

const walk = require("./util/core/walk");
const getPropertyDescriptor = require("./util/core/get-property-descriptor");
const hasOwnProperty =
    require("@sinonjs/commons").prototypes.object.hasOwnProperty;
const push = require("@sinonjs/commons").prototypes.array.push;

function collectMethod(methods, object, prop, propOwner) {
    if (
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 787 characters
- Lines: 28
