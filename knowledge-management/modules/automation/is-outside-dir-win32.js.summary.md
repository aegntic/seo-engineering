# Summary of is-outside-dir-win32.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/test-exclude/is-outside-dir-win32.js`

## Content Preview
```
'use strict';

const path = require('path');
const minimatch = require('minimatch');

const dot = { dot: true };

module.exports = function(dir, filename) {
    return !minimatch(path.resolve(dir, filename), path.join(dir, '**'), dot);
};
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 239 characters
- Lines: 11
