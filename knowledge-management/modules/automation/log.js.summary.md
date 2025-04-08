# Summary of log.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nise/lib/fake-server/log.js`

## Content Preview
```
"use strict";
var inspect = require("util").inspect;

function log(response, request) {
    var str;

    str = `Request:\n${inspect(request)}\n\n`;
    str += `Response:\n${inspect(response)}\n\n`;

    /* istanbul ignore else: when this.logger is not a function, it can't be called */
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 389 characters
- Lines: 17
