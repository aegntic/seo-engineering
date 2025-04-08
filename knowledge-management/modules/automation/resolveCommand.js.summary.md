# Summary of resolveCommand.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cross-spawn/lib/util/resolveCommand.js`

## Content Preview
```
'use strict';

const path = require('path');
const which = require('which');
const getPathKey = require('path-key');

function resolveCommandAttempt(parsed, withoutPathExt) {
    const env = parsed.options.env || process.env;
    const cwd = process.cwd();
    const hasCustomCwd = parsed.options.cwd != null;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1557 characters
- Lines: 53
