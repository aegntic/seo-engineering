# Summary of is-outside-dir-posix.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/test-exclude/is-outside-dir-posix.js`

## Content Preview
```
'use strict';

const path = require('path');

module.exports = function(dir, filename) {
    return /^\.\./.test(path.relative(dir, filename));
};

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 147 characters
- Lines: 8
