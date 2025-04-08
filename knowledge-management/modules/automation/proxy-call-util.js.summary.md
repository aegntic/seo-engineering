# Summary of proxy-call-util.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/sinon/lib/sinon/proxy-call-util.js`

## Content Preview
```
"use strict";

const push = require("@sinonjs/commons").prototypes.array.push;

exports.incrementCallCount = function incrementCallCount(proxy) {
    proxy.called = true;
    proxy.callCount += 1;
    proxy.notCalled = false;
    proxy.calledOnce = proxy.callCount === 1;
    proxy.calledTwice = proxy.callCount === 2;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1767 characters
- Lines: 68
