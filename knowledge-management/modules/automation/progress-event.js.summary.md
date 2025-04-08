# Summary of progress-event.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nise/lib/event/progress-event.js`

## Content Preview
```
"use strict";

var Event = require("./event");

function ProgressEvent(type, progressEventRaw, target) {
    this.initEvent(type, false, false, target);
    this.loaded =
        typeof progressEventRaw.loaded === "number"
            ? progressEventRaw.loaded
            : null;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 596 characters
- Lines: 23
