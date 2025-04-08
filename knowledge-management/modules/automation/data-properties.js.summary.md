# Summary of data-properties.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/istanbul-lib-coverage/lib/data-properties.js`

## Content Preview
```
'use strict';

module.exports = function dataProperties(klass, properties) {
    properties.forEach(p => {
        Object.defineProperty(klass.prototype, p, {
            enumerable: true,
            get() {
                return this.data[p];
            }
        });
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 283 characters
- Lines: 13
