# Summary of fake-timers-src.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@sinonjs/fake-timers/src/fake-timers-src.js`

## Content Preview
```
"use strict";

const globalObject = require("@sinonjs/commons").global;
let timersModule, timersPromisesModule;
if (typeof require === "function" && typeof module === "object") {
    try {
        timersModule = require("timers");
    } catch (e) {
        // ignored
    }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 74198 characters
- Lines: 2153
