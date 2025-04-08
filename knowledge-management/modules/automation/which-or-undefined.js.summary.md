# Summary of which-or-undefined.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/spawn-wrap/lib/which-or-undefined.js`

## Content Preview
```
'use strict';

const which = require("which")

function whichOrUndefined(executable) {
  try {
    return which.sync(executable)
  } catch (error) {
  }
}
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 190 characters
- Lines: 13
