# Summary of custom-event.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nise/lib/event/custom-event.js`

## Content Preview
```
"use strict";

var Event = require("./event");

function CustomEvent(type, customData, target) {
    this.initEvent(type, false, false, target);
    this.detail = customData.detail || null;
}

CustomEvent.prototype = new Event();
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 311 characters
- Lines: 15
