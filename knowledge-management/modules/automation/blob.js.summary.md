# Summary of blob.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nise/lib/fake-xhr/blob.js`

## Content Preview
```
"use strict";

exports.isSupported = (function () {
    try {
        return Boolean(new Blob());
    } catch (e) {
        return false;
    }
})();

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 150 characters
- Lines: 10
