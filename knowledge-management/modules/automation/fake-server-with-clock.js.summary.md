# Summary of fake-server-with-clock.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nise/lib/fake-server/fake-server-with-clock.js`

## Content Preview
```
"use strict";

var FakeTimers = require("@sinonjs/fake-timers");
var fakeServer = require("./index");

// eslint-disable-next-line no-empty-function
function Server() {}
Server.prototype = fakeServer;

var fakeServerWithClock = new Server();
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1937 characters
- Lines: 74
